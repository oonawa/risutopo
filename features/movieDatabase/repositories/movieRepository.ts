import { and, eq, gte } from "drizzle-orm";

import { db } from "@/db/client";
import { movieCacheTable, moviesTable } from "@/db/schema";

export type CachedMovieRow = {
	movieId: number;
	title: string;
	backgroundImage: string;
	posterImage: string;
	runningMinutes: number;
	releaseDate: string;
	overview: string;
};

export type MovieData = {
	externalDatabaseMovieId: string;
	title: string;
	backgroundImage: string;
	posterImage: string;
	runningMinutes: number;
	releaseDate: string;
	overview: string;
};

export async function findCachedMovie(
	externalDatabaseMovieId: string,
	cacheThreshold: Date,
): Promise<CachedMovieRow | undefined> {
	const [cachedMovie] = await db
		.select({
			movieId: moviesTable.id,
			title: moviesTable.title,
			backgroundImage: moviesTable.backgroundImage,
			posterImage: moviesTable.posterImage,
			runningMinutes: moviesTable.runningMinutes,
			releaseDate: moviesTable.releaseDate,
			overview: moviesTable.overview,
		})
		.from(moviesTable)
		.innerJoin(movieCacheTable, eq(movieCacheTable.movieId, moviesTable.id))
		.where(
			and(
				eq(moviesTable.externalDatabaseMovieId, externalDatabaseMovieId),
				gte(movieCacheTable.cachedAt, cacheThreshold),
			),
		);

	return cachedMovie;
}

export async function upsertMovieWithCache(
	movieData: MovieData,
	cachedAt: Date,
): Promise<{ movieId: number }> {
	return db.transaction(async (tx) => {
		await tx
			.insert(moviesTable)
			.values(movieData)
			.onConflictDoUpdate({
				target: moviesTable.externalDatabaseMovieId,
				set: {
					title: movieData.title,
					backgroundImage: movieData.backgroundImage,
					posterImage: movieData.posterImage,
					runningMinutes: movieData.runningMinutes,
					releaseDate: movieData.releaseDate,
					overview: movieData.overview,
				},
			});

		const [movie] = await tx
			.select({ movieId: moviesTable.id })
			.from(moviesTable)
			.where(
				eq(
					moviesTable.externalDatabaseMovieId,
					movieData.externalDatabaseMovieId,
				),
			);

		if (!movie) {
			throw Error("movies_table への登録に失敗しました");
		}

		await tx
			.insert(movieCacheTable)
			.values({ movieId: movie.movieId, cachedAt })
			.onConflictDoUpdate({
				target: movieCacheTable.movieId,
				set: { cachedAt },
			});

		return movie;
	});
}
