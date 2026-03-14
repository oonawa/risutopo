import type { Result } from "@/features/shared/types/Result";
import type { ListItem } from "@/features/list/types/ListItem";
import {
	findListIdByPublicId,
	findListItemIdByPublicIdAndListId,
	findStreamingServiceBySlug,
	insertListItem,
	updateListItemByPublicIdAndListId,
} from "@/features/list/repositories/server/listRepository";

export async function storeListItemService({
	publicListId,
	movie,
	now,
}: {
	publicListId: string;
	movie: ListItem;
	now: Date;
}): Promise<Result<ListItem>> {
	const listId = await findListIdByPublicId(publicListId);
	if (listId === null) {
		return {
			success: false,
			error: {
				code: "NOT_FOUND_ERROR",
				message: "リストが見つかりませんでした。",
			},
		};
	}

	const streamingService = await findStreamingServiceBySlug(movie.serviceSlug);

	try {
		const titleOnService = movie.title;
		const listItemPublicId = movie.listItemId;
		const existingListItemId = await findListItemIdByPublicIdAndListId({
			listItemPublicId: movie.listItemId,
			listId,
		});
		const createdAt = existingListItemId === null ? movie.createdAt : now;

		if (existingListItemId !== null) {
			await updateListItemByPublicIdAndListId({
				listId,
				listItemPublicId,
				streamingServiceId: streamingService.id,
				movieId: movie.details?.movieId ?? null,
				watchUrl: movie.url,
				watchStatus: movie.isWatched ? 1 : 0,
				titleOnService,
			});
		} else {
			await insertListItem({
				listId,
				listItemPublicId,
				streamingServiceId: streamingService.id,
				movieId: movie.details?.movieId ?? null,
				watchUrl: movie.url,
				watchStatus: movie.isWatched ? 1 : 0,
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
				isWatched: movie.isWatched,
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
			error: {
				code: "INTERNAL_ERROR",
				message: "不明なエラーが発生しました。",
			},
		};
	}
}
