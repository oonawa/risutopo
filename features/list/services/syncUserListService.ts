import type { Tx } from "@/db/client";
import type { ListItem } from "@/features/list/types/ListItem";
import type { Result } from "@/features/shared/types/Result";
import { db } from "@/db/client";
import {
	findSameListItems,
	storeListItems,
	stremaingServiceIdListBySlugList,
	storeWatchedListItem,
	storeListItemMovieMatch,
} from "../repositories/server/listRepository";

export const syncUserListService = async ({
	listId,
	items,
}: {
	listId: number;
	items: ListItem[];
}): Promise<Result> => {
	const watchUrls = items.map((item) => item.url);

	try {
		return await db.transaction(async (tx) => {
			const existingDuplicateListItems = await findSameListItems({
				listId,
				watchUrls,
			});

			const existingDuplicateWatchUrlSet = new Set(
				existingDuplicateListItems.map((item) => item.watchUrl),
			);
			const newItems = items.filter(
				(item) => !existingDuplicateWatchUrlSet.has(item.url),
			);

			const storedNewItems = await storeNewListItems({ tx, listId, newItems });

			const resolved = resolveListItemIds({
				allLocalItems: items,
				newItems,
				storedNewItems,
				existingDuplicateListItems,
			});

			const watchedItems = resolved.flatMap(({ listItemId, localItem }) =>
				localItem.isWatched
					? [{ listItemId, watchedAt: localItem.watchedAt }]
					: [],
			);

			const movieMatches = resolved.flatMap(({ listItemId, localItem }) =>
				localItem.details
					? [{ listItemId, movieId: localItem.details.movieId }]
					: [],
			);

			await Promise.all([
				watchedItems.length > 0
					? storeWatchedListItem(tx, watchedItems)
					: undefined,
				movieMatches.length > 0
					? storeListItemMovieMatch(tx, movieMatches)
					: undefined,
			]);

			return {
				success: true,
			};
		});
	} catch (err) {
		console.error(err);
		return {
			success: false,
			error: {
				code: "INTERNAL_ERROR",
				message:
					"システムの内部エラーにより、ログインしていないときに追加した作品を保存できませんでした。",
			},
		};
	}
};

function resolveListItemIds({
	allLocalItems,
	newItems,
	storedNewItems,
	existingDuplicateListItems,
}: {
	allLocalItems: ListItem[];
	newItems: ListItem[];
	storedNewItems?: {
		id: number;
		publicId: string;
		createdAt: Date;
	}[];
	existingDuplicateListItems: {
		id: number;
		publicId: string;
		watchUrl: string;
	}[];
}): { listItemId: number; localItem: ListItem }[] {
	const fromNew = newItems.flatMap((item) => {
		const stored = storedNewItems?.find((s) => s.publicId === item.listItemId);
		return stored ? [{ listItemId: stored.id, localItem: item }] : [];
	});

	const fromExisting = existingDuplicateListItems.flatMap((existing) => {
		const local = allLocalItems.find((item) => item.url === existing.watchUrl);
		return local ? [{ listItemId: existing.id, localItem: local }] : [];
	});

	return [...fromNew, ...fromExisting];
}

async function storeNewListItems({
	tx,
	listId,
	newItems,
}: {
	tx: Tx;
	listId: number;
	newItems: ListItem[];
}) {
	const streamingServiceIdList = await stremaingServiceIdListBySlugList(
		tx,
		newItems.map((item) => item.serviceSlug),
	);

	const newItemsToSync: {
		publicId: string;
		listId: number;
		streamingServiceId: number;
		watchUrl: string;
		titleOnService: string;
		createdAt: Date;
	}[] = [];

	for (const newItem of newItems) {
		const streamingServiceId = streamingServiceIdList.find(
			(service) => service.slug === newItem.serviceSlug,
		);

		if (!streamingServiceId) {
			continue;
		}

		newItemsToSync.push({
			publicId: newItem.listItemId,
			listId,
			streamingServiceId: streamingServiceId.id,
			watchUrl: newItem.url,
			titleOnService: newItem.title,
			createdAt: newItem.createdAt,
		});
	}

	if (newItemsToSync.length === 0) {
		return;
	}

	return await storeListItems(tx, newItemsToSync);
}
