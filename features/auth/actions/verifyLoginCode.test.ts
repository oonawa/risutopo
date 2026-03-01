import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/db/client";
import type { Tx } from "@/db/client";
import {
	authTokensTable,
	loginAttemptsTable,
	usersTable,
} from "@/db/schema";
import { verifyLoginCode } from "./verifyLoginCode";
import { createHash, randomInt } from "node:crypto";
import { and, eq } from "drizzle-orm";

const { mockSetCookie, mockCookies, mockHeaders } = vi.hoisted(() => {
	const setCookie = vi.fn();
	const cookies = vi.fn(async () => ({
		set: setCookie,
	}));
	const headers = vi.fn(async () => ({
		get: (name: string) => {
			if (name === "x-forwarded-for") {
				return "127.0.0.1";
			}
			if (name === "user-agent") {
				return "vitest-agent";
			}
			return null;
		},
	}));

	return {
		mockSetCookie: setCookie,
		mockCookies: cookies,
		mockHeaders: headers,
	};
});

const { mockGenerateTempSessionToken } = vi.hoisted(() => {
	return {
		mockGenerateTempSessionToken: vi.fn(() => "mock-temp-session-token"),
	};
});

vi.mock("next/headers", () => ({
	cookies: mockCookies,
	headers: mockHeaders,
}));

vi.mock("@/features/auth/services/session", () => ({
	generateSessionToken: vi.fn(async () => "mock-session-token"),
	generateTempSessionToken: mockGenerateTempSessionToken,
	addDays: vi.fn((date: Date, days: number) => {
		return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
	}),
}));

function generateLoginCode() {
	return randomInt(100000, 1000000).toString();
}

function hashLoginCode(code: string) {
	return createHash("sha256").update(code).digest("hex");
}

async function insertLoginCode({
	tx,
	email,
	token,
	expiresAt,
	createdAt,
}: {
	tx: Tx;
	email: string;
	token: string;
	expiresAt: Date;
	createdAt: Date;
}) {
	const [user] = await tx
		.select()
		.from(usersTable)
		.where(eq(usersTable.email, email));

	await tx.insert(authTokensTable).values({
		token,
		tokenType: "login_code",
		email,
		userId: user?.id ?? null,
		expiresAt,
		createdAt,
	});
}

describe("verifyLoginCode", () => {
	const now = new Date("2026-02-16T00:00:00.000Z");
	const email = "verify-login-code-test@example.com";
	let loginCode = "";

	beforeEach(async () => {
		mockSetCookie.mockReset();
		mockGenerateTempSessionToken.mockReset();
		mockGenerateTempSessionToken.mockReturnValue("mock-temp-session-token");
		await db.delete(loginAttemptsTable);
		await db.delete(authTokensTable);
		await db.insert(usersTable).values({
			publicId: "verify-login-code-test-user",
			email,
		});

		loginCode = generateLoginCode();

		await db.transaction(async (tx) => {
			await insertLoginCode({
				tx,
				email,
				token: hashLoginCode(loginCode),
				expiresAt: new Date(now.getTime() + 10 * 60 * 1000),
				createdAt: now,
			});
		});
	});

	it("事前投入したログインコードを検証できる", async () => {
		const result = await verifyLoginCode(loginCode, now);

		expect(result.success).toBe(true);
		if (!result.success) {
			return;
		}

		expect(result.data.email).toBe(email);
		expect(result.data.isNewUser).toBe(false);
		expect(mockSetCookie).toHaveBeenCalledTimes(1);
		expect(mockSetCookie).toHaveBeenCalledWith(
			"session_token",
			expect.any(String),
			expect.objectContaining({
				httpOnly: true,
				sameSite: "lax",
			}),
		);
	});

	it("新規ユーザー分岐を通る", async () => {
		const newUserEmail = "verify-login-code-new-user@example.com";
		const newUserLoginCode = generateLoginCode();

		await db.transaction(async (tx) => {
			await insertLoginCode({
				tx,
				email: newUserEmail,
				token: hashLoginCode(newUserLoginCode),
				expiresAt: new Date(now.getTime() + 10 * 60 * 1000),
				createdAt: now,
			});
		});

		await verifyLoginCode(newUserLoginCode, now);

		expect(mockGenerateTempSessionToken).toHaveBeenCalledTimes(1);

		expect(mockSetCookie).toHaveBeenCalledTimes(1);
		expect(mockSetCookie).toHaveBeenCalledWith(
			"temp_session_token",
			"mock-temp-session-token",
			expect.objectContaining({
				httpOnly: true,
				sameSite: "lax",
			}),
		);

		const [tempToken] = await db
			.select()
			.from(authTokensTable)
			.where(
				and(
					eq(authTokensTable.email, newUserEmail),
					eq(authTokensTable.tokenType, "temp_session_token"),
					eq(authTokensTable.token, "mock-temp-session-token"),
				),
			);

		expect(tempToken).toBeDefined();
		expect(tempToken.userId).toBeNull();
	});
});
