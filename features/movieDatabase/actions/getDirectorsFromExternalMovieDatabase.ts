"use server";

import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import {
	directorCacheTable,
	directorsTable,
	movieDirectorsTable,
	moviesTable,
} from "@/db/schema";
import type { Result } from "@/features/shared/types/Result";

type Crew = {
	name: string;
	job: string;
};

type Credits = {
	crew: Crew[];
};

export async function getDirectorsFromExternalMovieDatabase(
	externalApiMovieId: number,
	now: Date,
): Promise<Result<string[]>> {
	const externalDatabaseMovieId = externalApiMovieId.toString();
	const cacheThreshold = new Date(now);
	cacheThreshold.setMonth(cacheThreshold.getMonth() - 6);

	const cachedDirectors = await db
		.select({
			name: directorsTable.name,
			cachedAt: directorCacheTable.cachedAt,
		})
		.from(moviesTable)
		.innerJoin(directorCacheTable, eq(directorCacheTable.movieId, moviesTable.id))
		.innerJoin(movieDirectorsTable, eq(movieDirectorsTable.movieId, moviesTable.id))
		.innerJoin(
			directorsTable,
			eq(movieDirectorsTable.directorId, directorsTable.id),
		)
		.where(eq(moviesTable.externalDatabaseMovieId, externalDatabaseMovieId));

	if (
		cachedDirectors.length > 0 &&
		cachedDirectors.every((director) => director.cachedAt >= cacheThreshold)
	) {
		return {
			success: true,
			data: cachedDirectors.map((director) => director.name),
		};
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

	const searchParams = new URLSearchParams({
		language: "ja-JP",
	});

	const response = await fetch(
		`https://api.themoviedb.org/3/movie/${externalApiMovieId}/credits?${searchParams.toString()}`,
		{
			method: "GET",
			headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` },
		},
	);

	if (!response.ok) {
		return {
			success: false,
			error: {
				code: "INTERNAL_ERROR",
				message: "連携している外部サービスとの接続に不具合があります。",
			},
		};
	}

	const { crew }: Credits = await response.json();
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
		await db.transaction(async (tx) => {
			for (const directorName of directors) {
				const [existingDirector] = await tx
					.select({ id: directorsTable.id })
					.from(directorsTable)
					.where(eq(directorsTable.name, directorName));

				let directorId = existingDirector?.id;

				if (!existingDirector) {
					const [insertedDirector] = await tx
						.insert(directorsTable)
						.values({
							name: directorName,
						})
						.returning({ id: directorsTable.id });

					if (!insertedDirector) {
						throw Error("directors_table への登録に失敗しました");
					}

					directorId = insertedDirector.id;
				}

				const [existingMovieDirector] = await tx
					.select({ id: movieDirectorsTable.id })
					.from(movieDirectorsTable)
					.where(
						and(
							eq(movieDirectorsTable.movieId, movie.id),
							eq(movieDirectorsTable.directorId, directorId),
						),
					);

				if (!existingMovieDirector) {
					await tx.insert(movieDirectorsTable).values({
						movieId: movie.id,
						directorId,
					});
				}
			}

			await tx
				.insert(directorCacheTable)
				.values({
					movieId: movie.id,
					cachedAt: now,
				})
				.onConflictDoUpdate({
					target: directorCacheTable.movieId,
					set: {
						cachedAt: now,
					},
				});
		});
	}

	return {
		success: true,
		data: directors,
	};
}
