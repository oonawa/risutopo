"use server";

import type { Result } from "@/features/shared/types/Result";
import type { TmdbSearchResponse } from "../types/TmdbResponse";

export async function searchExternalMovieDatabase(
	title: string,
	page = "1",
): Promise<Result<TmdbSearchResponse>> {
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
		query: title,
		include_adult: "false",
		language: "ja-JP",
		page,
	});

	const response = await fetch(
		`https://api.themoviedb.org/3/search/movie?${searchParams.toString()}`,
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

	const data: TmdbSearchResponse = await response.json();

	return {
		success: true,
		data,
	};
}
