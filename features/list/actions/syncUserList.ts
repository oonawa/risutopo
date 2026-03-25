"use server";

import type { Result } from "@/features/shared/types/Result";
import type { LocalListItems } from "@/features/user/schemas/localListSchema";
import { localListItemsSchema } from "@/features/user/schemas/localListSchema";
import { syncUserListService } from "../../list/services/syncUserListService";
import { currentUserId } from "@/features/shared/actions/currentUserId";
import { userListIdAndPublicListId } from "../repositories/server/listRepository";

export const syncUserList = async ({
	localUserListItems,
}: {
	localUserListItems: LocalListItems;
}): Promise<Result<{ publicListId: string }>> => {
	const getLoginUserResult = await currentUserId();

	if (!getLoginUserResult.success) {
		return {
			success: false,
			error: {
				code: "UNAUTHORIZED_ERROR",
				message: "ログイン、またはユーザー登録を行なってください。",
			},
		};
	}

	const parseResult = localListItemsSchema.safeParse(localUserListItems);

	if (!parseResult.success) {
		return {
			success: false,
			error: {
				code: "VALIDATION_ERROR",
				message: "データが無効のため、リストを同期できませんでした。",
			},
		};
	}

	const userId = getLoginUserResult.data.userId;
	const list = await userListIdAndPublicListId(userId);

	if (!list) {
		return {
			success: false,
			error: {
				code: "NOT_FOUND_ERROR",
				message: "同期するリストが見つかりませんでした。",
			},
		};
	}

	const result = await syncUserListService({
		listId: list.id,
		items: parseResult.data,
	});

	if (!result.success) {
		return result;
	}

	return {
		success: true,
		data: {
			publicListId: list.publicListId,
		},
	};
};
