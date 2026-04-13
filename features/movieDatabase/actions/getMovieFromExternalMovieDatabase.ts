"use server";

import type { Result } from "@/features/shared/types/Result";
import type { OfficialMovieInfo } from "../services/getMovieWithCacheService";
import { getMovieWithCache } from "../services/getMovieWithCacheService";

export async function getMovieFromExternalMovieDatabase(
	externalApiMovieId: number,
): Promise<Result<OfficialMovieInfo>> {
	return getMovieWithCache(externalApiMovieId);
}
