import { migrate } from "drizzle-orm/libsql/migrator";
import { afterEach, beforeAll, beforeEach } from "vitest";
import { resetDatabase, seedDatabase } from "@/tests/helpers/db";
import { db } from "@/db/client";

await migrate(db, { migrationsFolder: "./migrations" });

beforeAll(async () => {
	await seedDatabase();
});

beforeEach(async () => {
	await resetDatabase();
});

afterEach(async () => {
	await resetDatabase();
});
