import { migrate } from "drizzle-orm/libsql/migrator";
import { afterAll, beforeAll, beforeEach } from "vitest";
import { resetDatabase, cleanupTables, seedDatabase } from "@/tests/helpers/db";
import { db } from "@/db/client";

await migrate(db, { migrationsFolder: "./migrations" });

beforeAll(async () => {
	await seedDatabase();
});

beforeEach(async () => {
	await resetDatabase();
});

afterAll(async () => {
	await cleanupTables();
});
