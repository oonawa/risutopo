import { db } from "@/db/client";
import { sql } from "drizzle-orm";
import {
	directorCacheTable,
	directorsTable,
	listItemMovieMatchTable,
	listItemsTable,
	loginCodesTable,
	loginAttemptsTable,
	movieCacheTable,
	moviesTable,
	sessionTokensTable,
	streamingServicesTable,
	tempSessionTokensTable,
	movieDirectorsTable,
	listsTable,
	userEmailsTable,
	usersTable,
	watchedItemsTable,
} from "@/db/schema";
import { SUPPORTED_SERVICES } from "@/app/consts";

export const streamingServicesSeed = Object.values(SUPPORTED_SERVICES).map(
	({ name, slug }) => ({
		name,
		slug,
	}),
);

export async function cleanupTables() {
	await db.delete(loginAttemptsTable);
	await db.delete(loginCodesTable);
	await db.delete(tempSessionTokensTable);
	await db.delete(sessionTokensTable);
	await db.delete(watchedItemsTable);
	await db.delete(listItemMovieMatchTable);
	await db.delete(listItemsTable);
	await db.delete(directorCacheTable);
	await db.delete(movieDirectorsTable);
	await db.delete(directorsTable);
	await db.delete(movieCacheTable);
	await db.delete(moviesTable);
	await db.delete(listsTable);
	await db.delete(userEmailsTable);
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
	await db.run(sql`DELETE FROM sqlite_sequence WHERE name = 'user_emails_table'`);
	await db.run(sql`DELETE FROM sqlite_sequence WHERE name = 'login_attempts_table'`);
	await db.run(
		sql`DELETE FROM sqlite_sequence WHERE name = 'movie_directors_table'`,
	);
	await db.run(sql`DELETE FROM sqlite_sequence WHERE name = 'lists_table'`);
	await db.run(
		sql`DELETE FROM sqlite_sequence WHERE name = 'list_items_table'`,
	);
}

export async function resetDatabase() {
	await cleanupTables();
	await resetSequences();
}
