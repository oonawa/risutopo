"use server";

import type { Result } from "@/features/shared/types/Result";
import { currentUserId } from "@/features/shared/actions/currentUserId";
import {
	findListIdByUserId,
	findCheckedSubListIdsByListId,
} from "../repositories/server/listRepository";

/**
 * ログイン済みユーザーのリスト全アイテムのサブリスト所属情報を返す。
 * Map<listItemPublicId, subListPublicId[]> の形式でシリアライズするため、
 * [string, string[]][] として返す。
 */
export async function getCheckedSubListIds(): Promise<
	Result<[string, string[]][]>
> {
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

	const listId = await findListIdByUserId(authResult.data.userId);

	if (!listId) {
		return { success: true, data: [] };
	}

	const rows = await findCheckedSubListIdsByListId(listId);

	const map = new Map<string, string[]>();
	for (const row of rows) {
		const existing = map.get(row.listItemPublicId);
		if (existing) {
			existing.push(row.subListPublicId);
		} else {
			map.set(row.listItemPublicId, [row.subListPublicId]);
		}
	}

	return { success: true, data: [...map.entries()] };
}
