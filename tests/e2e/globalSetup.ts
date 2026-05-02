import { migrate } from "drizzle-orm/libsql/migrator";
import { db } from "./lib/testDb";
import { seedDatabase } from "./lib/dbHelpers";
import { sql } from "drizzle-orm";

export default async function globalSetup() {
	await db.run(sql`PRAGMA journal_mode=WAL`);
	await migrate(db, { migrationsFolder: "./migrations" });
	await seedDatabase();
}
