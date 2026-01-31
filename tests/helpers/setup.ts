import { afterAll, beforeEach } from "vitest";
import { resetDatabase, cleanupTables } from "@/tests/helpers/db";

beforeEach(async () => {
	await resetDatabase();
});

afterAll(async () => {
	await cleanupTables();
});
