import { migrate } from "drizzle-orm/libsql/migrator";
import { db } from "./lib/testDb";
import { seedDatabase } from "./lib/dbHelpers";

export default async function globalSetup() {
	await migrate(db, { migrationsFolder: "./migrations" });
	await seedDatabase();
}
