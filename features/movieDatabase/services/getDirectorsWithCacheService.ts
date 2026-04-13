import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { moviesTable } from "@/db/schema";
import type { Result } from "@/features/shared/types/Result";
import {
	findCachedDirectors,
	upsertDirectorsWithCache,
} from "../repositories/directorRepository";
import { fetchWithRetry } from "../utils/fetchWithRetry";

type Crew = {
	name: string;
	job: string;
};

type Credits = {
	crew: Crew[];
};

export async function getDirectorsWithCache(
	externalApiMovieId: number,
): Promise<Result<string[]>> {
	const now = new Date();
	const externalDatabaseMovieId = externalApiMovieId.toString();
	const cacheThreshold = new Date(now);
	cacheThreshold.setMonth(cacheThreshold.getMonth() - 6);

	const cachedDirectors = await findCachedDirectors(
		externalDatabaseMovieId,
		cacheThreshold,
	);

	if (cachedDirectors !== null) {
		return { success: true, data: cachedDirectors };
	}

	if (!process.env.TMDB_API_KEY) {
		console.error("TMDB_API_KEYがセットされていません");

		return {
			success: false,
			error: {
				code: "INTERNAL_ERROR",
				message: "連携している外部サービスとの接続に不具合があります。",
			},
		};
	}

	const searchParams = new URLSearchParams({ language: "ja-JP" });

	const fetchResult = await fetchWithRetry(
		`https://api.themoviedb.org/3/movie/${externalApiMovieId}/credits?${searchParams.toString()}`,
		{
			method: "GET",
			headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` },
		},
		{ maxRetries: 2, delays: [500, 1000] },
	);

	if (!fetchResult.success) {
		return fetchResult;
	}

	const { crew }: Credits = await fetchResult.data.json();
	const directors = [
		...new Set(
			crew
				.filter((member) => member.job === "Director")
				.map((member) => member.name),
		),
	];

	const [movie] = await db
		.select({ id: moviesTable.id })
		.from(moviesTable)
		.where(eq(moviesTable.externalDatabaseMovieId, externalDatabaseMovieId));

	if (movie && directors.length > 0) {
		await upsertDirectorsWithCache(movie.id, directors, now);
	}

	return { success: true, data: directors };
}
