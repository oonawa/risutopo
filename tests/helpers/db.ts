import { db } from "@/db/client";
import { sql } from "drizzle-orm";
import { moviesTable, streamingServicesTable } from "@/db/schema";

export const streamingServicesSeed = [
	{ name: "U-NEXT", slug: "unext" },
	{ name: "Netflix", slug: "netflix" },
	{ name: "Hulu", slug: "hulu" },
	{ name: "Disney+", slug: "disney-plus" },
	{ name: "Prime Video", slug: "prime-video" },
];

export async function cleanupTables() {
	await db.delete(moviesTable);
	await db.delete(streamingServicesTable);
}

export async function resetSequences() {
	await db.run(
		sql`DELETE FROM sqlite_sequence WHERE name = 'streaming_services_table'`,
	);
	await db.run(sql`DELETE FROM sqlite_sequence WHERE name = 'movies'`);
}

export async function seedDatabase() {
	await db.insert(streamingServicesTable).values(streamingServicesSeed);
}

export async function resetDatabase() {
	await cleanupTables();
	await resetSequences();
	await seedDatabase();
}
