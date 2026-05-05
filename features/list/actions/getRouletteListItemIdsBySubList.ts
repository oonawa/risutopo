"use server";

import z from "zod";
import type { Result } from "@/features/shared/types/Result";
import { currentUserId } from "@/features/shared/actions/currentUserId";
import {
	findListIdByUserId,
	findSubListByPublicId,
	findSubListItemsBySubListId,
} from "../repositories/server/listRepository";

const schema = z.object({ subListPublicId: z.string().uuid() });

export async function getRouletteListItemIdsBySubList(
	subListPublicId: string,
): Promise<Result<string[]>> {
	const parsed = schema.safeParse({ subListPublicId });

	if (!parsed.success) {
		return {
			success: false,
			error: { code: "VALIDATION_ERROR", message: "不正なリクエストです。" },
		};
	}

	const authResult = await currentUserId();

	if (!authResult.success) {
		return {
			success: false,
			error: {
				code: "UNAUTHORIZED_ERROR",
				message: "ログインかユーザー登録をしてください。",
			},
		};
	}

	const userListId = await findListIdByUserId(authResult.data.userId);
	const subList = await findSubListByPublicId(parsed.data.subListPublicId);

	if (!subList || subList.listId !== userListId) {
		return {
			success: false,
			error: { code: "NOT_FOUND_ERROR", message: "サブリストが見つかりませんでした。" },
		};
	}

	const items = await findSubListItemsBySubListId(subList.id);

	return { success: true, data: items.map((item) => item.listItemId) };
}
