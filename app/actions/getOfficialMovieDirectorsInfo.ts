// https://api.themoviedb.org/3/movie/{movie_id}/credits

"use server";

type Crew = {
	name: string;
	job: string;
};

type Credits = {
	crew: Crew[];
};

import type { Result } from "../types/Result";
export async function getOfficialMovieDirectorsInfo(
	externalApiMovieId: number,
): Promise<Result<string[]>> {
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
				message: "連携している外部サービスとの接続に不具合があります。",
			},
		};
	}

	const { crew }: Credits = await response.json();
	const directors = crew.filter((crew) => crew.job === "Director");

	return {
		success: true,
		data: directors.map((director) => director.name),
	};
}
