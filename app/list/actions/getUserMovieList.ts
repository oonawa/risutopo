"use server";

import { desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import {
	directorsTable,
	listItemsTable,
	listsTable,
	movieDirectorsTable,
	moviesTable,
	streamingServicesTable,
} from "@/db/schema";
import type { MovieInfo } from "@/app/types/MovieInputForm/MovieInfo";

type ListItemRow = {
	listItemId: string;
	title: string;
	url: string;
	serviceSlug: MovieInfo["serviceSlug"];
	serviceName: MovieInfo["serviceName"];
	watchStatus: 0 | 1;
	movieId: number | null;
	officialTitle: string | null;
	backgroundImage: string | null;
	posterImage: string | null;
	runnningMinutes: number | null;
	releaseYear: number | null;
	overview: string | null;
	externalDatabaseMovieId: string | null;
};

type UserMovieList = {
	listId: number;
	movies: MovieInfo[];
};

export async function getUserMovieList(userId: number): Promise<UserMovieList> {
	const [list] = await db
		.select({ id: listsTable.id })
		.from(listsTable)
		.where(eq(listsTable.userId, userId));

	const rows: ListItemRow[] = await db
		.select({
			listItemId: listItemsTable.publicId,
			title: listItemsTable.titleOnService,
			url: listItemsTable.watchUrl,
			serviceSlug: streamingServicesTable.slug,
			serviceName: streamingServicesTable.name,
			watchStatus: listItemsTable.watchStatus,
			movieId: listItemsTable.movieId,
			officialTitle: moviesTable.title,
			backgroundImage: moviesTable.backgroundImage,
			posterImage: moviesTable.posterImage,
			runnningMinutes: moviesTable.runnningMinutes,
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
		.where(eq(listItemsTable.listId, list.id))
		.orderBy(desc(listItemsTable.id));

	const movieIds = rows
		.flatMap((row) => {
			return row.movieId === null ? [] : [row.movieId];
		})
		.filter((movieId, index, allMovieIds) => {
			return allMovieIds.indexOf(movieId) === index;
		});

	const directorsByMovieId = new Map<number, string[]>();

	if (movieIds.length > 0) {
		const directorRows = await db
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

		for (const row of directorRows) {
			const current = directorsByMovieId.get(row.movieId);
			if (current) {
				current.push(row.directorName);
				continue;
			}

			directorsByMovieId.set(row.movieId, [row.directorName]);
		}
	}

	const movies = rows.map((row) => {
		if (row.movieId === null) {
			return {
				listItemId: row.listItemId,
				title: row.title,
				url: row.url,
				serviceSlug: row.serviceSlug,
				serviceName: row.serviceName,
				isWatched: row.watchStatus === 1,
			};
		}

		if (
			row.officialTitle === null ||
			row.backgroundImage === null ||
			row.posterImage === null ||
			row.runnningMinutes === null ||
			row.releaseYear === null ||
			row.overview === null ||
			row.externalDatabaseMovieId === null
		) {
			return {
				listItemId: row.listItemId,
				title: row.title,
				url: row.url,
				serviceSlug: row.serviceSlug,
				serviceName: row.serviceName,
				isWatched: row.watchStatus === 1,
			};
		}

		const externalDatabaseMovieId = Number(row.externalDatabaseMovieId);
		const safeExternalDatabaseMovieId = Number.isNaN(externalDatabaseMovieId)
			? row.movieId
			: externalDatabaseMovieId;

		return {
			listItemId: row.listItemId,
			title: row.title,
			url: row.url,
			serviceSlug: row.serviceSlug,
			serviceName: row.serviceName,
			isWatched: row.watchStatus === 1,
			details: {
				movieId: row.movieId,
				officialTitle: row.officialTitle,
				backgroundImage: row.backgroundImage,
				posterImage: row.posterImage,
				director: directorsByMovieId.get(row.movieId) ?? [],
				runnningMinutes: row.runnningMinutes,
				releaseYear: row.releaseYear,
				externalDatabaseMovieId: safeExternalDatabaseMovieId,
				overview: row.overview,
			},
		};
	});

	return {
		listId: list.id,
		movies,
	};
}
