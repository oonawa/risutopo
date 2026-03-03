"use server";

import { and, eq, gte } from "drizzle-orm";
import { TMDB_IMAGE_BASE_URL } from "@/app/consts";
import { db } from "@/db/client";
import { moviesTable } from "@/db/schema";
import type { Result } from "@/features/shared/types/Result";
import type { TmdbMovieResponse } from "../types/TmdbResponse";

type OfficialMovieInfo = TmdbMovieResponse & {
	movieId: number;
};

export async function getMovieFromExternalMovieDatabase(
	externalApiMovieId: number,
	now: Date,
): Promise<Result<OfficialMovieInfo>> {
	const externalDatabaseMovieId = externalApiMovieId.toString();
	const cacheThreshold = new Date(now);
	cacheThreshold.setMonth(cacheThreshold.getMonth() - 6);

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
		.where(
			and(
				eq(moviesTable.externalDatabaseMovieId, externalDatabaseMovieId),
				gte(moviesTable.cachedAt, cacheThreshold),
			),
		);

	if (cachedMovie) {
		return {
			success: true,
			data: {
				movieId: cachedMovie.movieId,
				id: externalApiMovieId,
				title: cachedMovie.title,
				backdrop_path: cachedMovie.backgroundImage,
				poster_path: cachedMovie.posterImage,
				runtime: cachedMovie.runningMinutes,
				release_date: cachedMovie.releaseDate,
				overview: cachedMovie.overview,
			},
		};
	}

	if (!process.env.TMDB_API_KEY) {
		console.error("TMDB_API_KEYがセットされていません");

		return {
			success: false,
			error: {
				message: "連携している外部サービスとの接続に不具合があります。",
			},
		};
	}

	const searchParams = new URLSearchParams({
		language: "ja-JP",
	});

	const response = await fetch(
		`https://api.themoviedb.org/3/movie/${externalApiMovieId}?${searchParams.toString()}`,
		{
			method: "GET",
			headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` },
		},
	);

	if (!response.ok) {
		return {
			success: false,
			error: {
				message: "連携している外部サービスとの接続に不具合があります。",
			},
		};
	}

	const data: TmdbMovieResponse = await response.json();
	const releaseYear = new Date(data.release_date).getFullYear();

	await db
		.insert(moviesTable)
		.values({
			externalDatabaseMovieId,
			title: data.title,
			backgroundImage: TMDB_IMAGE_BASE_URL + data.backdrop_path,
			posterImage: TMDB_IMAGE_BASE_URL + data.poster_path,
			runningMinutes: data.runtime,
			releaseDate: data.release_date,
			releaseYear,
			cachedAt: now,
			overview: data.overview,
		})
		.onConflictDoUpdate({
			target: moviesTable.externalDatabaseMovieId,
			set: {
				title: data.title,
				backgroundImage: TMDB_IMAGE_BASE_URL + data.backdrop_path,
				posterImage: TMDB_IMAGE_BASE_URL + data.poster_path,
				runningMinutes: data.runtime,
				releaseDate: data.release_date,
				releaseYear,
				cachedAt: now,
				overview: data.overview,
			},
		});

	const [insertedOrUpdatedMovie] = await db
		.select({ movieId: moviesTable.id })
		.from(moviesTable)
		.where(eq(moviesTable.externalDatabaseMovieId, externalDatabaseMovieId));

	return {
		success: true,
		data: {
			movieId: insertedOrUpdatedMovie.movieId,
			...data,
		},
	};
}
