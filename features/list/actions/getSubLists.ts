"use server";

import type { Result } from "@/features/shared/types/Result";
import { currentUserId } from "@/features/shared/actions/currentUserId";
import {
	findListIdByUserId,
	findSubListsByListId,
} from "../repositories/server/listRepository";

export async function getSubLists(): Promise<
	Result<{ publicId: string; name: string }[]>
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

	const subLists = await findSubListsByListId(listId);

	return {
		success: true,
		data: subLists.map(({ publicId, name }) => ({ publicId, name })),
	};
}
