"use server";

import { URL } from "node:url";
import { db } from "@/db/client";
import { and, eq } from "drizzle-orm";
import {
	moviesTable,
	movieServicesTable,
	listMoviesTable,
	streamingServicesTable,
} from "@/db/schema";
import type { Result } from "@/app/types/Result";
import type { Tx } from "@/db/client";
import type { MovieFormError } from "../types/MovieInputForm/MovieFormError";
import type { SupportedServiceName, SupportedServiceSlug } from "@/app/consts";
import { SUPPORTED_SERVICES } from "@/app/consts";
import type { MovieInputValues } from "../types/MovieInputForm/MovieInputValues";
import type { MovieInfo } from "../types/MovieInputForm/MovieInfo";
import { movieShareLinkSchema } from "../movieShareLinkSchema";
import { movieInfoSchema } from "../movieInfoSchema";

const STREAMING_SERVICE_ERROR_MESSAGE =
	"ストリーミングサービスを読み取れませんでした。もう一度やり直してください。";

type Args = {
	listId: number | null;
} & MovieInputValues;

export async function addMovie({
	listId,
	mobile,
	browser,
}: Args): Promise<Result<MovieInfo, MovieFormError>> {
	if (mobile) {
		const result = movieShareLinkSchema.safeParse({ value: mobile.shareLink });
		if (!result.success) {
			return {
				success: false,
				error: result.error,
			};
		}
	} else if (browser) {
		const { title, url } = browser;
		const result = movieInfoSchema.safeParse({ title, url });
		if (!result.success) {
			return {
				success: false,
				error: result.error,
			};
		}
	}

	const movieInfoResult = mobile
		? buildMovieInfoFromMobile(mobile.shareLink)
		: buildMovieInfoFromBrowser({ title: browser.title, url: browser.url });

	if (!movieInfoResult.success) {
		return movieInfoResult;
	}

	const movieInfo = movieInfoResult.data;

	if (!listId) {
		return {
			success: true,
			data: movieInfo,
		};
	}

	const streamingServiceId = await findStreamingServiceId(
		movieInfo.serviceSlug,
	);

	if (!streamingServiceId) {
		return {
			success: false,
			error: {
				message: STREAMING_SERVICE_ERROR_MESSAGE,
			},
		};
	}

	try {
		await db.transaction(async (tx) => {
			const movieServiceId = await createMovieService(
				tx,
				movieInfo.title,
				streamingServiceId,
				movieInfo.url,
			);
			await createListMovie(tx, listId, movieServiceId);
		});
	} catch (err) {
		console.error(err);

		return {
			success: false,
			error: { message: "すみませんが、もう一度やり直してください。" },
		};
	}

	return {
		success: true,
		data: movieInfo,
	};
}

function buildMovieInfoFromMobile(
	shareLink: string,
): Result<MovieInfo, MovieFormError> {
	const url = extractUrl(shareLink);
	if (!url) {
		return {
			success: false,
			error: {
				message: "URLを読み取れませんでした。もう一度やり直してください。",
			},
		};
	}

	const matcherResult = resolveMatcherFromUrl(url);
	if (!matcherResult.success) {
		return matcherResult;
	}

	const movieInfo = buildMovieInfo(url, matcherResult.data, shareLink);
	if (!movieInfo) {
		return {
			success: false,
			error: {
				message: "映画を読み取れませんでした。もう一度やり直してください。",
			},
		};
	}

	return { success: true, data: movieInfo };
}

function buildMovieInfoFromBrowser({
	title,
	url,
}: {
	title: string;
	url: string;
}): Result<MovieInfo, MovieFormError> {
	const matcherResult = resolveMatcherFromUrl(url);
	if (!matcherResult.success) {
		return matcherResult;
	}

	return {
		success: true,
		data: {
			title: normalizeTitle(title),
			url: url,
			serviceSlug: matcherResult.data.slug,
			serviceName: matcherResult.data.name,
		},
	};
}

type ServiceMatcher = {
	slug: SupportedServiceSlug;
	name: SupportedServiceName;
	matchUrl(hostname: string): boolean;
	extractTitle(text: string): string | null;
};
function serviceMatchers(): ServiceMatcher[] {
	return [
		{
			slug: SUPPORTED_SERVICES.NETFLIX.slug,
			name: SUPPORTED_SERVICES.NETFLIX.name,
			matchUrl: (hostname) =>
				hostname.includes(SUPPORTED_SERVICES.NETFLIX.hostname),
			extractTitle: (text) => text.match(/「\s*(.+?)\s*」/)?.[1] ?? null,
		},
		{
			slug: SUPPORTED_SERVICES.U_NEXT.slug,
			name: SUPPORTED_SERVICES.U_NEXT.name,
			matchUrl: (hostname) =>
				hostname.includes(SUPPORTED_SERVICES.U_NEXT.hostname),
			extractTitle: (text) => text.match(/「(.+?)」/)?.[1] ?? null,
		},
		{
			slug: SUPPORTED_SERVICES.HULU.slug,
			name: SUPPORTED_SERVICES.HULU.name,
			matchUrl: (hostname) =>
				hostname.includes(SUPPORTED_SERVICES.HULU.hostname),
			extractTitle: (text) => text.match(/「(.+?)」/)?.[1] ?? null,
		},
		{
			slug: SUPPORTED_SERVICES.PRIME_VIDEO.slug,
			name: SUPPORTED_SERVICES.PRIME_VIDEO.name,
			matchUrl: (hostname) =>
				hostname.includes(SUPPORTED_SERVICES.PRIME_VIDEO.hostname),
			extractTitle: (text) =>
				text.match(/、(.+?)を観ている/)?.[1] ??
				text.match(/やあ、(.+?)を/)?.[1] ??
				null,
		},
		{
			slug: SUPPORTED_SERVICES.DISNEY_PLUS.slug,
			name: SUPPORTED_SERVICES.DISNEY_PLUS.name,
			matchUrl: (hostname) =>
				hostname.includes(SUPPORTED_SERVICES.DISNEY_PLUS.hostname),
			extractTitle: (text) => text.match(/「(.+?)」/)?.[1] ?? null,
		},
	];
}

function extractUrl(text: string): string | null {
	return text.match(/https?:\/\/[^\s]+/)?.[0] ?? null;
}

function parseHostname(url: string): string | null {
	try {
		return new URL(url).hostname;
	} catch {
		return null;
	}
}

function resolveMatcherFromUrl(url: string): Result<ServiceMatcher> {
	const hostname = parseHostname(url);
	if (!hostname) {
		return {
			success: false,
			error: {
				message: "URLを読み取れませんでした。もう一度やり直してください。",
			},
		};
	}

	const matcher = findMatcher(hostname);
	if (!matcher) {
		return {
			success: false,
			error: {
				message: STREAMING_SERVICE_ERROR_MESSAGE,
			},
		};
	}

	return {
		success: true,
		data: matcher,
	};
}

function findMatcher(hostname: string): ServiceMatcher | null {
	return (
		serviceMatchers().find((m) => {
			return m.matchUrl(hostname);
		}) ?? null
	);
}

function normalizeTitle(title: string): string {
	return title
		.replace(/･/g, "・")
		.replace(/\(/g, "（")
		.replace(/\)/g, "）")
		.replace(/\s+/g, " ")
		.replace(/（吹替版）/g, "")
		.replace(/（字幕版）/g, "")
		.trim();
}

function buildMovieInfo(
	url: string,
	matcher: ServiceMatcher,
	text: string,
): MovieInfo | null {
	const rawTitle = matcher.extractTitle(text);
	if (!rawTitle) return null;
	const title = normalizeTitle(rawTitle);
	return {
		title,
		url,
		serviceSlug: matcher.slug,
		serviceName: matcher.name,
	};
}

async function findStreamingServiceId(
	slug: SupportedServiceSlug,
): Promise<number | null> {
	const [service] = await db
		.select()
		.from(streamingServicesTable)
		.where(eq(streamingServicesTable.slug, slug));
	return service?.id ?? null;
}

async function createMovie(tx: Tx, title: string): Promise<number> {
	const [created] = await tx
		.insert(moviesTable)
		.values({ title })
		.returning({ id: moviesTable.id });
	return created.id;
}

async function createMovieService(
	tx: Tx,
	title: string,
	streamingServiceId: number,
	watchUrl: string,
): Promise<number> {
	const [existing] = await tx
		.select({
			id: movieServicesTable.id,
			watchUrl: movieServicesTable.watchUrl,
		})
		.from(movieServicesTable)
		.innerJoin(moviesTable, eq(movieServicesTable.movieId, moviesTable.id))
		.where(
			and(
				eq(moviesTable.title, title),
				eq(movieServicesTable.streamingServiceId, streamingServiceId),
				eq(movieServicesTable.watchUrl, watchUrl),
			),
		);

	if (existing) {
		return existing.id;
	}

	const movieId = await createMovie(tx, title);
	const [created] = await tx
		.insert(movieServicesTable)
		.values({ movieId, streamingServiceId, watchUrl })
		.returning({ id: movieServicesTable.id });

	return created.id;
}

async function createListMovie(
	tx: Tx,
	listId: number,
	movieServiceId: number,
): Promise<void> {
	await tx.insert(listMoviesTable).values({ listId, movieServiceId });
}
