"use server";

import crypto from "node:crypto";
import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import {
	listsTable,
	listItemsTable,
	streamingServicesTable,
} from "@/db/schema";
import type { Result } from "@/app/types/Result";
import type { MovieFormError } from "../types/MovieInputForm/MovieFormError";
import type { MovieInfo } from "../types/MovieInputForm/MovieInfo";

type Args = {
	listId: number;
	movie: MovieInfo;
	isWatched: boolean;
	now: Date;
};

export async function storeListItem({
	listId,
	movie,
	isWatched,
	now,
}: Args): Promise<Result<MovieInfo, MovieFormError>> {
	const [list] = await db
		.select({ id: listsTable.id })
		.from(listsTable)
		.where(eq(listsTable.id, listId));

	if (!list) {
		return {
			success: false,
			error: { message: "映画リストが見つかりません。" },
		};
	}

	const [streamingService] = await db
		.select({
			id: streamingServicesTable.id,
			slug: streamingServicesTable.slug,
			name: streamingServicesTable.name,
		})
		.from(streamingServicesTable)
		.where(eq(streamingServicesTable.slug, movie.serviceSlug));

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

		const storedMovie: MovieInfo = {
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
		};

		if (movie.listItemId) {
			await db
				.update(listItemsTable)
				.set({
					streamingServiceId: streamingService.id,
					movieId: movie.details?.movieId ?? null,
					watchUrl: movie.url,
					watchStatus: isWatched ? 1 : 0,
					titleOnService,
				})
				.where(
					and(
						eq(listItemsTable.publicId, movie.listItemId),
						eq(listItemsTable.listId, list.id),
					),
				);
		} else {
			await db.insert(listItemsTable).values({
				listId: list.id,
				publicId: listItemPublicId,
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
			data: storedMovie,
		};
	} catch (error) {
		console.error(error);

		return {
			success: false,
			error: { message: "映画の追加に失敗しました。" },
		};
	}
}
