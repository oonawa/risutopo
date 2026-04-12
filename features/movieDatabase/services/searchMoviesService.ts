import type { Result } from "@/features/shared/types/Result";
import type { TmdbSearchResponse } from "../types/TmdbResponse";
import { fetchWithRetry } from "../utils/fetchWithRetry";

export async function searchMovies(
	title: string,
	page: string,
): Promise<Result<TmdbSearchResponse>> {
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
		query: title,
		include_adult: "false",
		language: "ja-JP",
		page,
	});

	const fetchResult = await fetchWithRetry(
		`https://api.themoviedb.org/3/search/movie?${searchParams.toString()}`,
		{
			method: "GET",
			headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` },
		},
		{ maxRetries: 1, delays: [500] },
	);

	if (!fetchResult.success) {
		return fetchResult;
	}

	const data: TmdbSearchResponse = await fetchResult.data.json();

	return { success: true, data };
}
