"use server";

import type { Result } from "@/features/shared/types/Result";
import { getDirectorsWithCache } from "../services/getDirectorsWithCacheService";

export async function getDirectorsFromExternalMovieDatabase(
	externalApiMovieId: number,
): Promise<Result<string[]>> {
	return getDirectorsWithCache(externalApiMovieId);
}
