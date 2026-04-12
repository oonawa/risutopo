import { TMDB_IMAGE_BASE_URL } from "@/app/consts";
import type { Result } from "@/features/shared/types/Result";
import {
	findCachedMovie,
	upsertMovieWithCache,
} from "../repositories/movieRepository";
import type { TmdbMovieResponse } from "../types/TmdbResponse";
import { fetchWithRetry } from "../utils/fetchWithRetry";

export type OfficialMovieInfo = TmdbMovieResponse & {
	movieId: number;
};

export async function getMovieWithCache(
	externalApiMovieId: number,
): Promise<Result<OfficialMovieInfo>> {
	const now = new Date();
	const externalDatabaseMovieId = externalApiMovieId.toString();
	const cacheThreshold = new Date(now);
	cacheThreshold.setMonth(cacheThreshold.getMonth() - 6);

	const cachedMovie = await findCachedMovie(
		externalDatabaseMovieId,
		cacheThreshold,
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
				code: "INTERNAL_ERROR",
				message: "連携している外部サービスとの接続に不具合があります。",
			},
		};
	}

	const searchParams = new URLSearchParams({ language: "ja-JP" });

	const fetchResult = await fetchWithRetry(
		`https://api.themoviedb.org/3/movie/${externalApiMovieId}?${searchParams.toString()}`,
		{
			method: "GET",
			headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` },
		},
		{ maxRetries: 2, delays: [500, 1000] },
	);

	if (!fetchResult.success) {
		return fetchResult;
	}

	const data: TmdbMovieResponse = await fetchResult.data.json();

	const { movieId } = await upsertMovieWithCache(
		{
			externalDatabaseMovieId,
			title: data.title,
			backgroundImage: TMDB_IMAGE_BASE_URL + data.backdrop_path,
			posterImage: TMDB_IMAGE_BASE_URL + data.poster_path,
			runningMinutes: data.runtime,
			releaseDate: data.release_date,
			overview: data.overview,
		},
		now,
	);

	return { success: true, data: { movieId, ...data } };
}
