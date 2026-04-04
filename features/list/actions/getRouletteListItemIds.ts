"use server";

import z from "zod";
import type { Result } from "@/features/shared/types/Result";
import { currentUserId } from "@/features/shared/actions/currentUserId";
import {
	userListId,
	listItemPublicIdsByListId,
} from "../repositories/server/listRepository";

const schema = z.object({ publicListId: z.string().uuid() });

export async function getRouletteListItemIds(
	publicListId: string,
): Promise<Result<string[]>> {
	const parsed = schema.safeParse({ publicListId });

	if (!parsed.success) {
		return {
			success: false,
			error: { code: "VALIDATION_ERROR", message: "不正なリクエストです。" },
		};
	}

	const userResult = await currentUserId();

	if (!userResult.success) {
		return {
			success: false,
			error: {
				code: "UNAUTHORIZED_ERROR",
				message: "ログインかユーザー登録をしてください。",
			},
		};
	}

	const listId = await userListId(userResult.data.userId, parsed.data.publicListId);

	if (!listId) {
		return {
			success: false,
			error: {
				code: "NOT_FOUND_ERROR",
				message: "リストが見つかりませんでした。",
			},
		};
	}

	const ids = await listItemPublicIdsByListId(listId, userResult.data.userId);

	return { success: true, data: ids };
}
