// E2E テスト用 DB ヘルパー（@/tests/helpers/db の E2E 版）
import { sql } from "drizzle-orm";
import { db } from "./testDb";
import {
	deletedUsersTable,
	directorCacheTable,
	directorsTable,
	listItemMovieMatchTable,
	listItemsTable,
	listsTable,
	loginAttemptsTable,
	loginCodesTable,
	movieCacheTable,
	movieDirectorsTable,
	moviesTable,
	reauthTokensTable,
	sessionTokensTable,
	streamingServicesTable,
	tempSessionTokensTable,
	userEmailsTable,
	usersTable,
	watchedItemsTable,
} from "@/db/schema";
import { SUPPORTED_SERVICES } from "@/app/consts";

export async function cleanupTables() {
	await db.delete(reauthTokensTable);
	await db.delete(deletedUsersTable);
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

export async function resetSequences() {
	await db.run(
		sql`DELETE FROM sqlite_sequence WHERE name = 'streaming_services_table'`,
	);
	await db.run(sql`DELETE FROM sqlite_sequence WHERE name = 'movies_table'`);
	await db.run(sql`DELETE FROM sqlite_sequence WHERE name = 'directors_table'`);
	await db.run(sql`DELETE FROM sqlite_sequence WHERE name = 'users_table'`);
	await db.run(
		sql`DELETE FROM sqlite_sequence WHERE name = 'user_emails_table'`,
	);
	await db.run(
		sql`DELETE FROM sqlite_sequence WHERE name = 'login_attempts_table'`,
	);
	await db.run(
		sql`DELETE FROM sqlite_sequence WHERE name = 'movie_directors_table'`,
	);
	await db.run(sql`DELETE FROM sqlite_sequence WHERE name = 'lists_table'`);
	await db.run(
		sql`DELETE FROM sqlite_sequence WHERE name = 'list_items_table'`,
	);
}

export async function seedDatabase() {
	const values = Object.values(SUPPORTED_SERVICES).map(({ name, slug }) => ({
		name,
		slug,
	}));
	await db.insert(streamingServicesTable).values(values).onConflictDoNothing();
}

export async function resetDatabase() {
	await cleanupTables();
	await resetSequences();
}
