import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/db/client";
import { authTokensTable, usersTable } from "@/db/schema";
import {
	generateTempSessionToken,
	verifyTempSessionToken,
} from "./session";

describe("auth token verification", () => {
	const now = new Date("2026-02-16T00:00:00.000Z");

	beforeEach(async () => {
		await db.delete(authTokensTable);
		await db.delete(usersTable);
	});

	it("有効な仮認証トークンを検証できる", async () => {
		const email = "verify-temp-session-token-test@example.com";
		const tempToken = generateTempSessionToken();

		await db.insert(authTokensTable).values({
			token: tempToken,
			tokenType: "temp_session_token",
			email,
			expiresAt: new Date(now.getTime() + 10 * 60 * 1000),
			createdAt: now,
		});

		const result = await verifyTempSessionToken({
			tempToken,
			now,
		});

		expect(result).toStrictEqual({ email });
	});
});
