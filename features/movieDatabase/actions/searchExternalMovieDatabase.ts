"use server";

import type { Result } from "@/features/shared/types/Result";
import { searchMovies } from "../services/searchMoviesService";
import type { TmdbSearchResponse } from "../types/TmdbResponse";

export async function searchExternalMovieDatabase(
	title: string,
	page = "1",
): Promise<Result<TmdbSearchResponse>> {
	return searchMovies(title, page);
}
