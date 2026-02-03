import { db } from "@/db/client";
import { sql } from "drizzle-orm";
import {
	moviesTable,
	streamingServicesTable,
	listMoviesTable,
	movieServicesTable,
	listsTable,
	usersTable,
} from "@/db/schema";

export const streamingServicesSeed = [
	{ name: "U-NEXT", slug: "unext" },
	{ name: "Netflix", slug: "netflix" },
	{ name: "Hulu", slug: "hulu" },
	{ name: "Disney+", slug: "disney-plus" },
	{ name: "Prime Video", slug: "prime-video" },
];

export async function cleanupTables() {
	await db.delete(listMoviesTable);
	await db.delete(movieServicesTable);
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
	await db.run(sql`DELETE FROM sqlite_sequence WHERE name = 'users_table'`);
	await db.run(
		sql`DELETE FROM sqlite_sequence WHERE name = 'movie_services_table'`,
	);
	await db.run(sql`DELETE FROM sqlite_sequence WHERE name = 'lists_table'`);
	await db.run(
		sql`DELETE FROM sqlite_sequence WHERE name = 'list_movies_table'`,
	);
}

export async function resetDatabase() {
	await cleanupTables();
	await resetSequences();
}
