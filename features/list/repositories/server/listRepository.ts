import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import {
	directorsTable,
	listItemsTable,
	listsTable,
	movieDirectorsTable,
	moviesTable,
	streamingServicesTable,
} from "@/db/schema";
import type { ListItem } from "@/features/list/types/ListItem";

export type ListItemRow = {
	listItemId: string;
	title: string;
	url: string;
	createdAt: Date;
	serviceSlug: ListItem["serviceSlug"];
	serviceName: ListItem["serviceName"];
	watchStatus: 0 | 1;
	movieId: number | null;
	officialTitle: string | null;
	backgroundImage: string | null;
	posterImage: string | null;
	runningMinutes: number | null;
	releaseYear: number | null;
	overview: string | null;
	externalDatabaseMovieId: string | null;
};

export async function findListById(listId: number) {
	const [list] = await db
		.select({ id: listsTable.id })
		.from(listsTable)
		.where(eq(listsTable.id, listId));

	return list;
}

export async function findListIdByUserId(userId: number) {
	const [list] = await db
		.select({ id: listsTable.id })
		.from(listsTable)
		.where(eq(listsTable.userId, userId));

	return list?.id ?? null;
}

export async function findStreamingServiceBySlug(slug: ListItem["serviceSlug"]) {
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

export async function updateListItemByPublicIdAndListId({
	listId,
	listItemPublicId,
	streamingServiceId,
	movieId,
	watchUrl,
	watchStatus,
	titleOnService,
}: {
	listId: number;
	listItemPublicId: string;
	streamingServiceId: number;
	movieId: number | null;
	watchUrl: string;
	watchStatus: 0 | 1;
	titleOnService: string;
}) {
	await db
		.update(listItemsTable)
		.set({
			streamingServiceId,
			movieId,
			watchUrl,
			watchStatus,
			titleOnService,
		})
		.where(
			and(
				eq(listItemsTable.publicId, listItemPublicId),
				eq(listItemsTable.listId, listId),
			),
		);
}

export async function insertListItem({
	listId,
	listItemPublicId,
	streamingServiceId,
	movieId,
	watchUrl,
	watchStatus,
	titleOnService,
	createdAt,
}: {
	listId: number;
	listItemPublicId: string;
	streamingServiceId: number;
	movieId: number | null;
	watchUrl: string;
	watchStatus: 0 | 1;
	titleOnService: string;
	createdAt: Date;
}) {
	await db.insert(listItemsTable).values({
		listId,
		publicId: listItemPublicId,
		streamingServiceId,
		movieId,
		watchUrl,
		watchStatus,
		titleOnService,
		createdAt,
	});
}

export async function findListItemIdByPublicId(listItemPublicId: string) {
	const [listItem] = await db
		.select({ id: listItemsTable.id })
		.from(listItemsTable)
		.where(eq(listItemsTable.publicId, listItemPublicId));

	return listItem?.id ?? null;
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
	await db
		.delete(listItemsTable)
		.where(eq(listItemsTable.publicId, listItemPublicId));
}

export async function findListItemRowsByListId(
	listId: number,
): Promise<ListItemRow[]> {
	return await db
		.select({
			listItemId: listItemsTable.publicId,
			title: listItemsTable.titleOnService,
			url: listItemsTable.watchUrl,
			createdAt: listItemsTable.createdAt,
			serviceSlug: streamingServicesTable.slug,
			serviceName: streamingServicesTable.name,
			watchStatus: listItemsTable.watchStatus,
			movieId: listItemsTable.movieId,
			officialTitle: moviesTable.title,
			backgroundImage: moviesTable.backgroundImage,
			posterImage: moviesTable.posterImage,
			runningMinutes: moviesTable.runningMinutes,
			releaseYear: moviesTable.releaseYear,
			overview: moviesTable.overview,
			externalDatabaseMovieId: moviesTable.externalDatabaseMovieId,
		})
		.from(listItemsTable)
		.innerJoin(
			streamingServicesTable,
			eq(listItemsTable.streamingServiceId, streamingServicesTable.id),
		)
		.leftJoin(moviesTable, eq(listItemsTable.movieId, moviesTable.id))
		.where(eq(listItemsTable.listId, listId))
		.orderBy(desc(listItemsTable.id));
}

export async function findDirectorRowsByMovieIds(
	movieIds: number[],
): Promise<Array<{ movieId: number; directorName: string }>> {
	if (movieIds.length === 0) {
		return [];
	}

	return await db
		.select({
			movieId: movieDirectorsTable.movieId,
			directorName: directorsTable.name,
		})
		.from(movieDirectorsTable)
		.innerJoin(directorsTable, eq(movieDirectorsTable.directorId, directorsTable.id))
		.where(inArray(movieDirectorsTable.movieId, movieIds));
}
