import type { Result } from "@/features/shared/types/Result";
import {
	deleteListItemByPublicId,
} from "@/features/list/repositories/server/listRepository";

export async function removeListItemService({
	listItemId,
}: {
	listItemId: string;
}): Promise<Result> {
	try {
		const deletedListItemId = await deleteListItemByPublicId(listItemId);
		if (!deletedListItemId) {
			return {
				success: false,
				error: {
					code: "NOT_FOUND_ERROR",
					message: "作品がリストへ登録されていないか、すでに削除されています。",
				},
			};
		}

		return { success: true };
	} catch (error) {
		console.error(error);
		return {
			success: false,
			error: {
				code: "INTERNAL_ERROR",
				message: "不明なエラーが発生しました。",
			},
		};
	}
}
