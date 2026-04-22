"use server";

import z from "zod";
import type { Result } from "@/features/shared/types/Result";
import type { ListItem } from "@/features/list/types/ListItem";
import { getUserListService } from "../services/getUserListService";
import { getSubListService } from "../services/getSubListService";
import {
	findSubListIdByPublicId,
	userListId,
} from "../repositories/server/listRepository";

const getUserMovieListSchema = z.object({
	publicListId: z.uuid(),
	userId: z.int(),
});

export async function getUserMovieList(
	publicListId: string,
	userId: number,
): Promise<Result<ListItem[]>> {
	const parsed = getUserMovieListSchema.safeParse({ publicListId, userId });

	if (!parsed.success) {
		return {
			success: false,
			error: {
				code: "VALIDATION_ERROR",
				message: "不正なリクエストです。",
			},
		};
	}

	const listId = await userListId(userId, publicListId);

	if (listId) {
		return await getUserListService(listId, userId);
	}

	const subListId = await findSubListIdByPublicId(publicListId);

	if (!subListId) {
		return {
			success: false,
			error: {
				code: "NOT_FOUND_ERROR",
				message: "リストが見つかりませんでした。",
			},
		};
	}

	return await getSubListService(subListId, userId);
}
