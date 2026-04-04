"use server";

import z from "zod";
import type { Result } from "@/features/shared/types/Result";
import type { ListItem } from "@/features/list/types/ListItem";

import { currentUserId } from "@/features/shared/actions/currentUserId";
import { getListItemService } from "../services/getListItemService";

const schema = z.object({ listItemId: z.string().uuid() });

export async function getListItemById(
	listItemId: string,
): Promise<Result<ListItem>> {
	const parsed = schema.safeParse({ listItemId });

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

	return getListItemService(parsed.data.listItemId, userResult.data.userId);
}
