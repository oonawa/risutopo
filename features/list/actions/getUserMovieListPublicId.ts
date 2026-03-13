"use server";

import { getUserMovieListPublicIdService } from "../services/getUserListPublicIdService";

export async function getUserMovieListPublicId(
	userId: number,
): Promise<string | null> {
	return await getUserMovieListPublicIdService(userId);
}
