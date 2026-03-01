import crypto from "node:crypto";
import type { Result } from "@/features/shared/types/Result";
import type { MovieFormError } from "@/features/list/types/ItemStoreError";
import type { ListItem } from "@/features/list/types/ListItem";
import {
	deleteListItemByPublicId,
	findListById,
	findListItemIdByPublicId,
	findListItemIdByPublicIdAndListId,
	findStreamingServiceBySlug,
	insertListItem,
	updateListItemByPublicIdAndListId,
} from "@/features/list/repositories/server/listRepository";

export async function storeListItem({
	listId,
	movie,
	isWatched,
	now,
}: {
	listId: number;
	movie: ListItem;
	isWatched: boolean;
	now: Date;
}): Promise<Result<ListItem, MovieFormError>> {
	const list = await findListById(listId);
	if (!list) {
		return {
			success: false,
			error: { message: "映画リストが見つかりません。" },
		};
	}

	const streamingService = await findStreamingServiceBySlug(movie.serviceSlug);
	if (!streamingService) {
		return {
			success: false,
			error: { message: "対象の配信サービスが見つかりません。" },
		};
	}

	try {
		const titleOnService = movie.title;
		const listItemPublicId = movie.listItemId ?? crypto.randomUUID();
		const createdAt = movie.listItemId ? movie.createdAt : now;

		if (movie.listItemId) {
			const existingListItem = await findListItemIdByPublicIdAndListId({
				listItemPublicId: movie.listItemId,
				listId: list.id,
			});
			if (!existingListItem) {
				return {
					success: false,
					error: { message: "更新対象の作品が見つかりません。" },
				};
			}

			await updateListItemByPublicIdAndListId({
				listId: list.id,
				listItemPublicId: movie.listItemId,
				streamingServiceId: streamingService.id,
				movieId: movie.details?.movieId ?? null,
				watchUrl: movie.url,
				watchStatus: isWatched ? 1 : 0,
				titleOnService,
			});
		} else {
			await insertListItem({
				listId: list.id,
				listItemPublicId,
				streamingServiceId: streamingService.id,
				movieId: movie.details?.movieId ?? null,
				watchUrl: movie.url,
				watchStatus: isWatched ? 1 : 0,
				titleOnService,
				createdAt: now,
			});
		}

		return {
			success: true,
			data: {
				listItemId: listItemPublicId,
				title: titleOnService,
				url: movie.url,
				serviceSlug: streamingService.slug,
				serviceName: streamingService.name,
				isWatched,
				createdAt,
				...(movie.details
					? {
							details: {
								...movie.details,
							},
						}
					: {}),
			},
		};
	} catch (error) {
		console.error(error);
		return {
			success: false,
			error: { message: "映画の追加に失敗しました。" },
		};
	}
}

export async function removeListItem({
	listItemId,
}: {
	listItemId: string;
}): Promise<Result> {
	try {
		const existingListItemId = await findListItemIdByPublicId(listItemId);
		if (!existingListItemId) {
			return {
				success: false,
				error: {
					message: "作品がリストへ登録されていないか、すでに削除されています。",
				},
			};
		}

		await deleteListItemByPublicId(listItemId);
		return { success: true };
	} catch (error) {
		console.error(error);
		return {
			success: false,
			error: { message: "映画の削除に失敗しました。" },
		};
	}
}
