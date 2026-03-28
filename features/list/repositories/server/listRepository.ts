import type { Tx } from "@/db/client";
import type { SupportedServiceSlug, SupportedServiceName } from "@/app/consts";
import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import {
	directorsTable,
	listItemMovieMatchTable,
	listItemsTable,
	listsTable,
	movieDirectorsTable,
	moviesTable,
	streamingServicesTable,
	watchedItemsTable,
} from "@/db/schema";
import type {
	WatchedState,
	UnwatchedState,
} from "@/features/list/types/ListItem";

export type ListItemRow = {
	listItemId: string;
	title: string;
	url: string;
	createdAt: Date;
	serviceSlug: SupportedServiceSlug;
	serviceName: SupportedServiceName;
	watchedAt: Date | null;
	movieId: number | null;
	officialTitle: string | null;
	backgroundImage: string | null;
	posterImage: string | null;
	runningMinutes: number | null;
	releaseDate: string | null;
	overview: string | null;
	externalDatabaseMovieId: string | null;
};

export async function userListId(userId: number, publicListId: string) {
	const [list] = await db
		.select({ id: listsTable.id })
		.from(listsTable)
		.where(
			and(eq(listsTable.publicId, publicListId), eq(listsTable.userId, userId)),
		);

	return list ? list.id : null;
}

export async function userListIdAndPublicListId(userId: number) {
	const [list] = await db
		.select({ id: listsTable.id, publicListId: listsTable.publicId })
		.from(listsTable)
		.where(eq(listsTable.userId, userId));

	return list ? list : null;
}

export async function findListIdByPublicId(publicListId: string) {
	const [list] = await db
		.select({ id: listsTable.id })
		.from(listsTable)
		.where(eq(listsTable.publicId, publicListId));

	return list?.id ?? null;
}

export async function findPublicListIdByUserId(userId: number) {
	const [list] = await db
		.select({ publicId: listsTable.publicId })
		.from(listsTable)
		.where(eq(listsTable.userId, userId));

	return list ? list.publicId : null;
}

export async function findListIdByUserId(userId: number) {
	const [list] = await db
		.select({ id: listsTable.id })
		.from(listsTable)
		.where(eq(listsTable.userId, userId));

	return list ? list.id : null;
}

export async function findStreamingServiceBySlug(slug: SupportedServiceSlug) {
	const [streamingService] = await db
		.select({
			id: streamingServicesTable.id,
			slug: streamingServicesTable.slug,
			name: streamingServicesTable.name,
		})
		.from(streamingServicesTable)
		.where(eq(streamingServicesTable.slug, slug));

	return streamingService;
}

export async function stremaingServiceIdListBySlugList(
	tx: Tx,
	serviceSlugs: SupportedServiceSlug[],
) {
	return await tx
		.select({
			id: streamingServicesTable.id,
			slug: streamingServicesTable.slug,
		})
		.from(streamingServicesTable)
		.where(inArray(streamingServicesTable.slug, serviceSlugs));
}

type WatchStateInput = WatchedState | UnwatchedState;

type UpsertListItemInput = {
	listId: number;
	listItemPublicId: string;
	streamingServiceId: number;
	movieId: number | null;
	watchUrl: string;
	titleOnService: string;
} & WatchStateInput;

export async function updateListItemByPublicIdAndListId({
	listId,
	listItemPublicId,
	streamingServiceId,
	movieId,
	watchUrl,
	isWatched,
	watchedAt,
	titleOnService,
}: UpsertListItemInput) {
	await db.transaction(async (tx) => {
		const [updatedListItem] = await tx
			.update(listItemsTable)
			.set({
				streamingServiceId,
				watchUrl,
				titleOnService,
			})
			.where(
				and(
					eq(listItemsTable.publicId, listItemPublicId),
					eq(listItemsTable.listId, listId),
				),
			)
			.returning({ id: listItemsTable.id });

		if (!updatedListItem) {
			return;
		}

		await tx
			.delete(listItemMovieMatchTable)
			.where(eq(listItemMovieMatchTable.listItemId, updatedListItem.id));

		if (movieId !== null) {
			await tx.insert(listItemMovieMatchTable).values({
				listItemId: updatedListItem.id,
				movieId,
			});
		}

		if (isWatched) {
			const [existingWatchedItem] = await tx
				.select({ listItemId: watchedItemsTable.listItemId })
				.from(watchedItemsTable)
				.where(eq(watchedItemsTable.listItemId, updatedListItem.id));

			if (!existingWatchedItem) {
				await tx.insert(watchedItemsTable).values({
					listItemId: updatedListItem.id,
					watchedAt,
				});
			}
		}
	});
}

export async function insertListItem({
	listId,
	listItemPublicId,
	streamingServiceId,
	movieId,
	watchUrl,
	isWatched,
	watchedAt,
	titleOnService,
	createdAt,
}: {
	createdAt: Date;
} & UpsertListItemInput) {
	await db.transaction(async (tx) => {
		const [insertedListItem] = await tx
			.insert(listItemsTable)
			.values({
				listId,
				publicId: listItemPublicId,
				streamingServiceId,
				watchUrl,
				titleOnService,
				createdAt,
			})
			.returning({ id: listItemsTable.id });

		if (movieId !== null) {
			await tx.insert(listItemMovieMatchTable).values({
				listItemId: insertedListItem.id,
				movieId,
			});
		}

		if (isWatched) {
			await tx.insert(watchedItemsTable).values({
				listItemId: insertedListItem.id,
				watchedAt,
			});
		}
	});
}

export async function storeListItems(
	tx: Tx,
	items: {
		publicId: string;
		listId: number;
		streamingServiceId: number;
		watchUrl: string;
		titleOnService: string;
		createdAt: Date;
	}[],
) {
	return await tx.insert(listItemsTable).values(items).returning({
		id: listItemsTable.id,
		publicId: listItemsTable.publicId,
		createdAt: listItemsTable.createdAt,
	});
}

export async function storeListItemMovieMatch(
	tx: Tx,
	matchedMovies: {
		listItemId: number;
		movieId: number;
	}[],
) {
	return await tx.insert(listItemMovieMatchTable).values(matchedMovies);
}

export async function storeWatchedListItem(
	tx: Tx,
	watchedItems: {
		listItemId: number;
		watchedAt: Date;
	}[],
) {
	await tx.insert(watchedItemsTable).values(watchedItems);
}

export async function findListItemIdByPublicIdAndListId({
	listItemPublicId,
	listId,
}: {
	listItemPublicId: string;
	listId: number;
}) {
	const [listItem] = await db
		.select({ id: listItemsTable.id })
		.from(listItemsTable)
		.where(
			and(
				eq(listItemsTable.publicId, listItemPublicId),
				eq(listItemsTable.listId, listId),
			),
		);

	return listItem?.id ?? null;
}

export async function deleteListItemByPublicId(listItemPublicId: string) {
	const [deleted] = await db
		.delete(listItemsTable)
		.where(eq(listItemsTable.publicId, listItemPublicId))
		.returning({ id: listItemsTable.id });

	return deleted?.id ?? null;
}

export async function userListItemsByListId(listId: number, userId: number) {
	return await db
		.select({
			listItemId: listItemsTable.publicId,
			title: listItemsTable.titleOnService,
			url: listItemsTable.watchUrl,
			createdAt: listItemsTable.createdAt,
			serviceSlug: streamingServicesTable.slug,
			serviceName: streamingServicesTable.name,
			watchedAt: watchedItemsTable.watchedAt,
			movieId: listItemMovieMatchTable.movieId,
			officialTitle: moviesTable.title,
			backgroundImage: moviesTable.backgroundImage,
			posterImage: moviesTable.posterImage,
			runningMinutes: moviesTable.runningMinutes,
			releaseDate: moviesTable.releaseDate,
			overview: moviesTable.overview,
			externalDatabaseMovieId: moviesTable.externalDatabaseMovieId,
		})
		.from(listItemsTable)
		.innerJoin(
			streamingServicesTable,
			eq(listItemsTable.streamingServiceId, streamingServicesTable.id),
		)
		.innerJoin(listsTable, eq(listItemsTable.listId, listsTable.id))
		.leftJoin(
			listItemMovieMatchTable,
			eq(listItemMovieMatchTable.listItemId, listItemsTable.id),
		)
		.leftJoin(moviesTable, eq(listItemMovieMatchTable.movieId, moviesTable.id))
		.leftJoin(
			watchedItemsTable,
			eq(watchedItemsTable.listItemId, listItemsTable.id),
		)
		.where(and(eq(listsTable.id, listId), eq(listsTable.userId, userId)))
		.orderBy(desc(listItemsTable.id));
}

export async function findMovieDirectorNames(movieIds: number[]) {
	if (movieIds.length === 0) {
		return [];
	}

	return await db
		.select({
			movieId: movieDirectorsTable.movieId,
			directorName: directorsTable.name,
		})
		.from(movieDirectorsTable)
		.innerJoin(
			directorsTable,
			eq(movieDirectorsTable.directorId, directorsTable.id),
		)
		.where(inArray(movieDirectorsTable.movieId, movieIds));
}

export async function findSameListItems({
	listId,
	watchUrls,
}: {
	listId: number;
	watchUrls: string[];
}) {
	if (watchUrls.length === 0) {
		return [];
	}

	return await db
		.select({
			id: listItemsTable.id,
			publicId: listItemsTable.publicId,
			watchUrl: listItemsTable.watchUrl,
		})
		.from(listItemsTable)
		.where(
			and(
				eq(listItemsTable.listId, listId),
				inArray(listItemsTable.watchUrl, watchUrls),
			),
		);
}
