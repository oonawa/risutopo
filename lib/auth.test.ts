import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/db/client";
import { authTokensTable, usersTable } from "@/db/schema";
import {
	generateSessionToken,
	generateTempSessionToken,
	verifySessionToken,
	verifyTempSessionToken,
} from "./auth";
import { eq } from "drizzle-orm";

describe("auth token verification", () => {
	const now = new Date("2026-02-16T00:00:00.000Z");

	beforeEach(async () => {
		await db.delete(authTokensTable);
		await db.delete(usersTable);
	});

	it("有効な認証トークンを検証できる", async () => {
		const email = "verify-session-token-test@example.com";
		const deviceId = "test-device-id";

		await db.insert(usersTable).values({
			publicId: "verify-session-token-test-user",
			email,
		});

		const [user] = await db
			.select({ id: usersTable.id })
			.from(usersTable)
			.where(eq(usersTable.email, email));

		expect(user).toBeDefined();
		if (!user) {
			return;
		}

		const sessionToken = await generateSessionToken({
			userId: user.id,
			email,
			deviceId,
		});

		await db.insert(authTokensTable).values({
			token: sessionToken,
			tokenType: "session_token",
			email,
			userId: user.id,
			deviceId,
			expiresAt: new Date(now.getTime() + 10 * 60 * 1000),
			createdAt: now,
		});

		const result = await verifySessionToken({ sessionToken, now });

		expect(result).toStrictEqual({
			userId: user.id,
			email,
			deviceId,
		});
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
