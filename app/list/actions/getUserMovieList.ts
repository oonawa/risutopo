"use server";

import { desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import {
	listsTable,
	listMoviesTable,
	movieServicesTable,
	moviesTable,
	streamingServicesTable,
} from "@/db/schema";

export async function getUserMovieList(userId: number) {
	const movies = await db
		.select({
			title: moviesTable.title,
			watchUrl: movieServicesTable.watchUrl,
			serviceSlug: streamingServicesTable.slug,
			serviceName: streamingServicesTable.name,
		})
		.from(listsTable)
		.innerJoin(listMoviesTable, eq(listMoviesTable.listId, listsTable.id))
		.innerJoin(
			movieServicesTable,
			eq(movieServicesTable.id, listMoviesTable.movieServiceId),
		)
		.innerJoin(moviesTable, eq(moviesTable.id, movieServicesTable.movieId))
		.innerJoin(
			streamingServicesTable,
			eq(streamingServicesTable.id, movieServicesTable.streamingServiceId),
		)
		.where(eq(listsTable.userId, userId))
		.orderBy(desc(listMoviesTable.id));

	return movies;
}
