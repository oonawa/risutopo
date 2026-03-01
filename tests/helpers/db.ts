import { db } from "@/db/client";
import { sql } from "drizzle-orm";
import {
	directorsTable,
	listItemsTable,
	moviesTable,
	streamingServicesTable,
	listMoviesTable,
	movieDirectorsTable,
	movieServicesTable,
	listsTable,
	usersTable,
} from "@/db/schema";
import { SUPPORTED_SERVICES } from "@/app/consts";

export const streamingServicesSeed = Object.values(SUPPORTED_SERVICES).map(
	({ name, slug }) => ({
		name,
		slug,
	}),
);

export async function cleanupTables() {
	await db.delete(listItemsTable);
	await db.delete(listMoviesTable);
	await db.delete(movieDirectorsTable);
	await db.delete(movieServicesTable);
	await db.delete(directorsTable);
	await db.delete(moviesTable);
	await db.delete(listsTable);
	await db.delete(usersTable);
}

export async function seedDatabase() {
	await db
		.insert(streamingServicesTable)
		.values(streamingServicesSeed)
		.onConflictDoNothing();
}

export async function resetSequences() {
	await db.run(
		sql`DELETE FROM sqlite_sequence WHERE name = 'streaming_services_table'`,
	);
	await db.run(sql`DELETE FROM sqlite_sequence WHERE name = 'movies_table'`);
	await db.run(sql`DELETE FROM sqlite_sequence WHERE name = 'directors_table'`);
	await db.run(sql`DELETE FROM sqlite_sequence WHERE name = 'users_table'`);
	await db.run(
		sql`DELETE FROM sqlite_sequence WHERE name = 'movie_services_table'`,
	);
	await db.run(
		sql`DELETE FROM sqlite_sequence WHERE name = 'movie_directors_table'`,
	);
	await db.run(sql`DELETE FROM sqlite_sequence WHERE name = 'lists_table'`);
	await db.run(
		sql`DELETE FROM sqlite_sequence WHERE name = 'list_movies_table'`,
	);
	await db.run(
		sql`DELETE FROM sqlite_sequence WHERE name = 'list_items_table'`,
	);
}

export async function resetDatabase() {
	await cleanupTables();
	await resetSequences();
}
