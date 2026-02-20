"use server";

import type { Result } from "../types/Result";
import type { MovieDetail } from "../types/MovieInputForm/MovieApi/MovieApiResponse";

export async function getOfficialMovieInfo(
	externalApiMovieId: number,
): Promise<Result<MovieDetail>> {
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

	const data: MovieDetail = await response.json();

	return {
		success: true,
		data,
	};
}
