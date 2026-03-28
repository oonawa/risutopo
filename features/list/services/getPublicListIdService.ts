import { findPublicListIdByUserId } from "@/features/list/repositories/server/listRepository";

export async function getPublicListIdService(
	userId: number,
): Promise<string | null> {
	return await findPublicListIdByUserId(userId);
}
