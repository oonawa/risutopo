"use server";

import { getUserMovieListPublicId as getUserMovieListPublicIdService } from "../services/listQueryService";

export async function getUserMovieListPublicId(
	userId: number,
): Promise<string | null> {
	return await getUserMovieListPublicIdService(userId);
}
