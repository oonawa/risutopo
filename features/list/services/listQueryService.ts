import { findListPublicIdByUserId } from "@/features/list/repositories/server/listRepository";

export async function getUserMovieListPublicId(
	userId: number,
): Promise<string | null> {
	return await findListPublicIdByUserId(userId);
}
