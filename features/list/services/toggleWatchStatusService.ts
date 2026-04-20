import type { Result } from "@/features/shared/types/Result";
import type { ListItem } from "@/features/list/types/ListItem";
import {
	findIntListItemIdByPublicId,
	insertWatchedItem,
	deleteWatchedItem,
} from "@/features/list/repositories/server/listRepository";

export async function toggleWatchStatusService({
	listItemId,
	isWatched,
	currentListItem,
}: {
	listItemId: string;
	isWatched: boolean;
	currentListItem: ListItem;
}): Promise<Result<ListItem>> {
	try {
		// 1. listItemId を int に変換
		const intListItemId = await findIntListItemIdByPublicId(listItemId);
		if (!intListItemId) {
			return {
				success: false,
				error: {
					code: "NOT_FOUND_ERROR",
					message: "作品がリストに登録されていません。",
				},
			};
		}

		// 2. isWatched の状態に応じて INSERT/DELETE
		if (isWatched) {
			await insertWatchedItem(intListItemId, new Date());
		} else {
			const deleted = await deleteWatchedItem(intListItemId);
			if (!deleted) {
				return {
					success: false,
					error: {
						code: "NOT_FOUND_ERROR",
						message: "視聴済みレコードが見つかりません。",
					},
				};
			}
		}

		// 3. 更新後の ListItem を構築
		const listItem: ListItem = isWatched
			? {
					...currentListItem,
					isWatched: true,
					watchedAt: new Date(),
				}
			: {
					...currentListItem,
					isWatched: false,
					watchedAt: null,
				};

		return {
			success: true,
			data: listItem,
		};
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
