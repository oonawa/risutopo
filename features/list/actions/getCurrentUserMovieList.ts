"use server";

import z from "zod";
import type { Result } from "@/features/shared/types/Result";
import type { ListItem } from "@/features/list/types/ListItem";
import { getUserListService } from "../services/getUserListService";
import { currentUserId } from "@/features/shared/actions/currentUserId";
import { userListId } from "../repositories/server/listRepository";

const getCurrentUserMovieListSchema = z.object({
	publicListId: z.uuid(),
});

export async function getCurrentUserMovieList(
	publicListId: string,
): Promise<Result<ListItem[]>> {
	const parsed = getCurrentUserMovieListSchema.safeParse({ publicListId });

	if (!parsed.success) {
		return {
			success: false,
			error: {
				code: "VALIDATION_ERROR",
				message: "不正なリクエストです。",
			},
		};
	}

	const result = await currentUserId();

	if (!result.success) {
		return {
			success: false,
			error: {
				code: "UNAUTHORIZED_ERROR",
				message: "ログインかユーザー登録をしてください。",
			},
		};
	}

	const listId = await userListId(result.data.userId, publicListId);

	if (!listId) {
		return {
			success: false,
			error: {
				code: "NOT_FOUND_ERROR",
				message: "リストが見つかりませんでした。",
			},
		};
	}

	return await getUserListService(listId, result.data.userId);
}
