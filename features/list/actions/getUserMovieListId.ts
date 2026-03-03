"use server";

import { getUserMovieListId as getUserMovieListIdService } from "../services/listQueryService";

export async function getUserMovieListId(userId: number): Promise<number | null> {
	return await getUserMovieListIdService(userId);
}
