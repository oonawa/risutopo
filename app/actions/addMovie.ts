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

type MovieInfo = {
	title: string;
	url: string;
	serviceSlug: string;
};

type TitleExtractor = (text: string) => string | null;
type ServiceMatcher = {
	slug: string;
	matchUrl: (hostname: string) => boolean;
	extractTitle: TitleExtractor;
};

const serviceMatchers: ServiceMatcher[] = [
	{
		slug: "netflix",
		matchUrl: (hostname) => hostname.includes("netflix.com"),
		extractTitle: (text) => text.match(/「\s*(.+?)\s*」/)?.[1] ?? null,
	},
	{
		slug: "unext",
		matchUrl: (hostname) => hostname.includes("unext.jp"),
		extractTitle: (text) => text.match(/「(.+?)」/)?.[1] ?? null,
	},
	{
		slug: "hulu",
		matchUrl: (hostname) => hostname.includes("hulu.jp"),
		extractTitle: (text) => text.match(/「(.+?)」/)?.[1] ?? null,
	},
	{
		slug: "prime-video",
		matchUrl: (hostname) => hostname.includes("amazon.co.jp"),
		extractTitle: (text) =>
			text.match(/、(.+?)を観ている/)?.[1] ??
			text.match(/やあ、(.+?)を/)?.[1] ??
			null,
	},
	{
		slug: "disney-plus",
		matchUrl: (hostname) => hostname.includes("disneyplus.com"),
		extractTitle: (text) => text.match(/「(.+?)」/)?.[1] ?? null,
	},
];

const extractUrl = (text: string): string | null => {
	return text.match(/https?:\/\/[^\s]+/)?.[0] ?? null;
};

const parseHostname = (url: string): string | null => {
	try {
		return new URL(url).hostname;
	} catch {
		return null;
	}
};

const findMatcher = (hostname: string): ServiceMatcher | null => {
	return serviceMatchers.find((m) => m.matchUrl(hostname)) ?? null;
};

const normalizeTitle = (title: string): string => {
	return title
		.replace(/･/g, "・")
		.replace(/\(/g, "（")
		.replace(/\)/g, "）")
		.replace(/\s+/g, " ")
		.replace(/（吹替版）/g, "")
		.replace(/（字幕版）/g, "")
		.trim();
};

const buildMovieInfo = (
	url: string,
	matcher: ServiceMatcher,
	text: string,
): MovieInfo | null => {
	const rawTitle = matcher.extractTitle(text);
	if (!rawTitle) return null;
	const title = normalizeTitle(rawTitle);
	return { title, url, serviceSlug: matcher.slug };
};

const findStreamingServiceId = async (slug: string): Promise<number | null> => {
	const [service] = await db
		.select()
		.from(streamingServicesTable)
		.where(eq(streamingServicesTable.slug, slug));
	return service?.id ?? null;
};

const findOrCreateMovie = async (title: string): Promise<number> => {
	const [existing] = await db
		.select()
		.from(moviesTable)
		.where(eq(moviesTable.title, title));
	if (existing) return existing.id;

	const [created] = await db.insert(moviesTable).values({ title }).returning();
	return created.id;
};

const createMovieService = async (
	movieId: number,
	streamingServiceId: number,
	watchUrl: string,
): Promise<number> => {
	const [created] = await db
		.insert(movieServicesTable)
		.values({ movieId, streamingServiceId, watchUrl })
		.returning();
	return created.id;
};

const createListMovie = async (
	listId: number,
	movieServiceId: number,
): Promise<void> => {
	await db.insert(listMoviesTable).values({ listId, movieServiceId });
};

export async function addMovie(
	pastedText: string,
	listId: number,
): Promise<MovieInfo | null> {
	const url = extractUrl(pastedText);
	if (!url) return null;

	const hostname = parseHostname(url);
	if (!hostname) return null;

	const matcher = findMatcher(hostname);
	if (!matcher) return null;

	const movieInfo = buildMovieInfo(url, matcher, pastedText);
	if (!movieInfo) return null;

	const streamingServiceId = await findStreamingServiceId(
		movieInfo.serviceSlug,
	);
	if (!streamingServiceId) return null;

	const movieId = await findOrCreateMovie(movieInfo.title);

	const movieServiceId = await createMovieService(
		movieId,
		streamingServiceId,
		movieInfo.url,
	);
	await createListMovie(listId, movieServiceId);

	return movieInfo;
}
