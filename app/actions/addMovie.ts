"use server";

import { URL } from "node:url";
import { db } from "@/db/client";
import { eq } from "drizzle-orm";
import {
	moviesTable,
	movieServicesTable,
	listMoviesTable,
	streamingServicesTable,
} from "@/db/schema";
import type { Result } from "@/app/types/Result";
import type { Tx } from "@/db/client";
import { SUPPORTED_SERVICES } from "@/app/consts";
import type { SupportedServiceSlug } from "@/app/consts";
import { movieShareLinkSchema } from "../movieShareLinkSchema";
import { movieInfoSchema } from "../movieInfoSchema";

type MovieInfo = {
	title: string;
	url: string;
	serviceSlug: SupportedServiceSlug;
};

type Args = {
	listId: number;
} & (
	| {
			mobile: { shareLink: string };
			browser?: never;
	  }
	| {
			browser: { title: string; url: string };
			mobile?: never;
	  }
);

export async function addMovie({
	listId,
	mobile,
	browser,
}: Args): Promise<Result<MovieInfo>> {
	const movieInfoResult = mobile
		? buildMovieInfoFromMobile(mobile.shareLink)
		: buildMovieInfoFromBrowser(browser);

	if (!movieInfoResult.success) {
		return movieInfoResult;
	}

	const movieInfo = movieInfoResult.data;
	const streamingServiceId = await findStreamingServiceId(
		movieInfo.serviceSlug,
	);
	if (!streamingServiceId) {
		return {
			success: false,
			error: {
				message:
					"ストリーミングサービスを読み取れませんでした。もう一度やり直してください。",
			},
		};
	}

	try {
		await db.transaction(async (tx) => {
			const movieId = await findOrCreateMovie(tx, movieInfo.title);

			const movieServiceId = await createMovieService(
				tx,
				movieId,
				streamingServiceId,
				movieInfo.url,
			);
			await createListMovie(tx, listId, movieServiceId);
		});

		return {
			success: true,
			data: movieInfo,
		};
	} catch (err) {
		console.error(err);

		return {
			success: false,
			error: { message: "すみませんが、もう一度やり直してください。" },
		};
	}
}

function validateMovieShareLink(shareLink: string) {
	return movieShareLinkSchema.safeParse({ value: shareLink });
}

function validateMovieInfo(title: string, url: string) {
	return movieInfoSchema.safeParse({ title, url });
}

function buildMovieInfoFromMobile(shareLink: string): Result<MovieInfo> {
	const result = validateMovieShareLink(shareLink);
	if (!result.success) {
		return {
			success: false,
			error: { message: "もう一度やり直してください。" },
		};
	}

	const url = extractUrl(shareLink);
	if (!url) {
		return {
			success: false,
			error: {
				message: "URLを読み取れませんでした。もう一度やり直してください。",
			},
		};
	}

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
				message: "URLを読み取れませんでした。もう一度やり直してください。",
			},
		};
	}

	const movieInfo = buildMovieInfo(url, matcher, shareLink);
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

function buildMovieInfoFromBrowser(
	browser: { title: string; url: string } | undefined,
): Result<MovieInfo> {
	if (!browser) {
		return {
			success: false,
			error: { message: "すみませんが、もう一度やり直してください。" },
		};
	}

	const result = validateMovieInfo(browser.title, browser.url);
	if (!result.success) {
		return {
			success: false,
			error: { message: "もう一度やり直してください。" },
		};
	}

	const hostname = parseHostname(browser.url);
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
				message: "URLを読み取れませんでした。もう一度やり直してください。",
			},
		};
	}

	return {
		success: true,
		data: {
			title: normalizeTitle(browser.title),
			url: browser.url,
			serviceSlug: matcher.slug,
		},
	};
}

type ServiceMatcher = {
	slug: SupportedServiceSlug;
	matchUrl(hostname: string): boolean;
	extractTitle(text: string): string | null;
};
function serviceMatchers(): ServiceMatcher[] {
	return [
		{
			slug: SUPPORTED_SERVICES.NETFLIX.slug,
			matchUrl: (hostname) =>
				hostname.includes(SUPPORTED_SERVICES.NETFLIX.hostname),
			extractTitle: (text) => text.match(/「\s*(.+?)\s*」/)?.[1] ?? null,
		},
		{
			slug: SUPPORTED_SERVICES.U_NEXT.slug,
			matchUrl: (hostname) =>
				hostname.includes(SUPPORTED_SERVICES.U_NEXT.hostname),
			extractTitle: (text) => text.match(/「(.+?)」/)?.[1] ?? null,
		},
		{
			slug: SUPPORTED_SERVICES.HULU.slug,
			matchUrl: (hostname) =>
				hostname.includes(SUPPORTED_SERVICES.HULU.hostname),
			extractTitle: (text) => text.match(/「(.+?)」/)?.[1] ?? null,
		},
		{
			slug: SUPPORTED_SERVICES.PRIME_VIDEO.slug,
			matchUrl: (hostname) =>
				hostname.includes(SUPPORTED_SERVICES.PRIME_VIDEO.hostname),
			extractTitle: (text) =>
				text.match(/、(.+?)を観ている/)?.[1] ??
				text.match(/やあ、(.+?)を/)?.[1] ??
				null,
		},
		{
			slug: SUPPORTED_SERVICES.DISNEY_PLUS.slug,
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
	return { title, url, serviceSlug: matcher.slug };
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

async function findOrCreateMovie(tx: Tx, title: string): Promise<number> {
	const [existing] = await tx
		.select()
		.from(moviesTable)
		.where(eq(moviesTable.title, title));
	if (existing) return existing.id;

	const [created] = await tx.insert(moviesTable).values({ title }).returning();
	return created.id;
}

async function createMovieService(
	tx: Tx,
	movieId: number,
	streamingServiceId: number,
	watchUrl: string,
): Promise<number> {
	const [created] = await tx
		.insert(movieServicesTable)
		.values({ movieId, streamingServiceId, watchUrl })
		.returning();
	return created.id;
}

async function createListMovie(
	tx: Tx,
	listId: number,
	movieServiceId: number,
): Promise<void> {
	await tx.insert(listMoviesTable).values({ listId, movieServiceId });
}
