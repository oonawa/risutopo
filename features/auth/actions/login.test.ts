import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/db/client";
import type { Tx } from "@/db/client";
import {
	authTokensTable,
	loginAttemptsTable,
	userEmailsTable,
	usersTable,
} from "@/db/schema";
import { login } from "./login";
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

vi.mock("next/headers", () => ({
	cookies: mockCookies,
	headers: mockHeaders,
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
		.select({ id: usersTable.id })
		.from(usersTable)
		.innerJoin(userEmailsTable, eq(userEmailsTable.userId, usersTable.id))
		.where(eq(userEmailsTable.email, email));

	await tx.insert(authTokensTable).values({
		token,
		tokenType: "login_code",
		email,
		userId: user?.id ?? null,
		expiresAt,
		createdAt,
	});
}

describe("login", () => {
	const now = new Date("2026-02-16T00:00:00.000Z");
	const loginCodeExpiresAt = new Date("2026-02-16T00:10:00.000Z");
	const sessionTokenExpiresAt = new Date("2026-03-18T00:00:00.000Z");
	const tempSessionTokenExpiresAt = new Date("2026-02-16T00:15:00.000Z");
	const expectedDeviceId = "c5232d93874ea7f5";
	const email = "verify-login-code-test@example.com";
	let loginCode = "";

	beforeEach(async () => {
		mockCookies.mockClear();
		mockHeaders.mockClear();
		mockSetCookie.mockReset();
		const [user] = await db.insert(usersTable).values({
			publicId: "verify-login-code-test-user",
		}).returning({ id: usersTable.id });
		await db.insert(userEmailsTable).values({
			userId: user.id,
			email,
		});

		loginCode = generateLoginCode();

		await db.transaction(async (tx) => {
			await insertLoginCode({
				tx,
				email,
				token: hashLoginCode(loginCode),
				expiresAt: loginCodeExpiresAt,
				createdAt: now,
			});
		});
	});

	it("ユーザーが入力した認証コードが有効であれば、30日間有効のトークンを新規に発行して認証済みの状態にする", async () => {
		const result = await login(loginCode, now);

		expect(result.success).toBe(true);
		if (!result.success) {
			return;
		}

		expect(result.data.email).toBe(email);
		expect(result.data.isNewUser).toBe(false);
		expect(mockCookies).toHaveBeenCalledTimes(1);
		expect(mockSetCookie).toHaveBeenCalledTimes(1);
		expect(mockSetCookie).toHaveBeenCalledWith(
			"session_token",
			expect.any(String),
			expect.objectContaining({
				httpOnly: true,
				sameSite: "lax",
			}),
		);
		const [[cookieKey, cookieValue, cookieOptions]] = mockSetCookie.mock.calls;
		expect(cookieKey).toBe("session_token");
		expect(typeof cookieValue).toBe("string");
		expect(cookieOptions).toEqual(
			expect.objectContaining({
				httpOnly: true,
				sameSite: "lax",
				secure: true,
				expires: sessionTokenExpiresAt,
			}),
		);

		const [savedLoginCode] = await db
			.select()
			.from(authTokensTable)
			.where(
				and(
					eq(authTokensTable.email, email),
					eq(authTokensTable.tokenType, "login_code"),
				),
			);

		expect(savedLoginCode).toBeUndefined();

		const [savedSessionToken] = await db
			.select()
			.from(authTokensTable)
			.where(
				and(
					eq(authTokensTable.email, email),
					eq(authTokensTable.tokenType, "session_token"),
				),
			);

		expect(savedSessionToken).toBeDefined();
		if (!savedSessionToken) {
			throw new Error("セッショントークンが保存されていません");
		}

		expect(savedSessionToken.token).toBe(cookieValue);
		expect(savedSessionToken.userId).not.toBeNull();
		expect(savedSessionToken.deviceId).toBe(expectedDeviceId);
		expect(savedSessionToken.createdAt).toEqual(now);
		expect(savedSessionToken.expiresAt).toEqual(sessionTokenExpiresAt);

		const [attempt] = await db
			.select()
			.from(loginAttemptsTable)
			.where(
				and(
					eq(loginAttemptsTable.email, email),
					eq(loginAttemptsTable.attemptType, "code_verify"),
				),
			);

		expect(attempt).toBeDefined();
		if (!attempt) {
			throw new Error("検証試行が記録されていません");
		}

		expect(attempt.ipAddress).toBe("127.0.0.1");
		expect(attempt.success).toBe(true);
	});

	it("メールアドレスが未登録だった場合は新規ユーザーとし、15分有効な仮認証トークンを発行する", async () => {
		const newUserEmail = "verify-login-code-new-user@example.com";
		const newUserLoginCode = generateLoginCode();

		await db.transaction(async (tx) => {
			await insertLoginCode({
				tx,
				email: newUserEmail,
				token: hashLoginCode(newUserLoginCode),
				expiresAt: loginCodeExpiresAt,
				createdAt: now,
			});
		});

		const result = await login(newUserLoginCode, now);

		expect(result.success).toBe(true);
		if (!result.success) {
			return;
		}

		expect(result.data.email).toBe(newUserEmail);
		expect(result.data.isNewUser).toBe(true);

		expect(mockCookies).toHaveBeenCalledTimes(1);
		expect(mockSetCookie).toHaveBeenCalledTimes(1);
		expect(mockSetCookie).toHaveBeenCalledWith(
			"temp_session_token",
			expect.any(String),
			expect.objectContaining({
				httpOnly: true,
				sameSite: "lax",
				secure: true,
				expires: tempSessionTokenExpiresAt,
			}),
		);
		const [[tempCookieKey, tempCookieValue, tempCookieOptions]] =
			mockSetCookie.mock.calls;
		expect(tempCookieKey).toBe("temp_session_token");
		expect(typeof tempCookieValue).toBe("string");
		expect(tempCookieOptions).toEqual(
			expect.objectContaining({
				httpOnly: true,
				sameSite: "lax",
				secure: true,
				expires: tempSessionTokenExpiresAt,
			}),
		);

		const [savedLoginCode] = await db
			.select()
			.from(authTokensTable)
			.where(
				and(
					eq(authTokensTable.email, newUserEmail),
					eq(authTokensTable.tokenType, "login_code"),
				),
			);

		expect(savedLoginCode).toBeUndefined();

		const [tempToken] = await db
			.select()
			.from(authTokensTable)
			.where(
				and(
					eq(authTokensTable.email, newUserEmail),
					eq(authTokensTable.tokenType, "temp_session_token"),
				),
			);

		expect(tempToken).toBeDefined();
		if (!tempToken) {
			throw new Error("一時セッショントークンが保存されていません");
		}

		expect(tempToken.token).toBe(tempCookieValue);
		expect(tempToken.userId).toBeNull();
		expect(tempToken.deviceId).toBe(expectedDeviceId);
		expect(tempToken.createdAt).toEqual(now);
		expect(tempToken.expiresAt).toEqual(tempSessionTokenExpiresAt);

		const [attempt] = await db
			.select()
			.from(loginAttemptsTable)
			.where(
				and(
					eq(loginAttemptsTable.email, newUserEmail),
					eq(loginAttemptsTable.attemptType, "code_verify"),
				),
			);

		expect(attempt).toBeDefined();
		if (!attempt) {
			throw new Error("検証試行が記録されていません");
		}

		expect(attempt.ipAddress).toBe("127.0.0.1");
		expect(attempt.success).toBe(true);
	});
});
