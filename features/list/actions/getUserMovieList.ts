"use server";

import z from "zod";
import type { Result } from "@/features/shared/types/Result";
import type { ListItem } from "@/features/list/types/ListItem";
import { getUserListService } from "../services/getUserListService";
import { userListId } from "../repositories/server/listRepository";

const getUserMovieListSchema = z.object({
	listPublicId: z.uuid(),
	userId: z.int(),
});

export async function getUserMovieList(
	listPublicId: string,
	userId: number,
): Promise<Result<ListItem[]>> {
	const parsed = getUserMovieListSchema.safeParse({ listPublicId, userId });

	if (!parsed.success) {
		return {
			success: false,
			error: {
				code: "VALIDATION_ERROR",
				message: "不正なリクエストです。",
			},
		};
	}

	const listId = await userListId(userId, listPublicId);

	if (!listId) {
		return {
			success: false,
			error: {
				code: "NOT_FOUND_ERROR",
				message: "リストが見つかりませんでした。",
			},
		};
	}

	return await getUserListService(listId, userId);
}
