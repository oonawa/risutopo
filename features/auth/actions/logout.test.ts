import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/db/client";
import { computeHmac, encrypt } from "@/features/shared/lib/encryption";
import {
	sessionTokensTable,
	userEmailsTable,
	usersTable,
} from "@/db/schema";
import { currentUserId } from "@/features/shared/actions/currentUserId";
import { verifySessionTokenService } from "@/features/auth/services/verifySessionTokenService";
import { generateSessionToken } from "@/features/shared/lib/jwt";
import { logout } from "./logout";

const { mockCookies, mockCookieStore } = vi.hoisted(() => {
	let sessionToken: string | undefined;

	return {
		mockCookies: vi.fn(async () => ({
			get: (name: string) => {
				if (name !== "session_token" || !sessionToken) {
					return undefined;
				}

				return { value: sessionToken };
			},
			delete: (name: string) => {
				if (name === "session_token") {
					sessionToken = undefined;
				}
			},
		})),
		mockCookieStore: {
			clear() {
				sessionToken = undefined;
			},
			set(value: string) {
				sessionToken = value;
			},
		},
	};
});

vi.mock("next/headers", () => ({
	cookies: mockCookies,
}));

describe("logout", () => {
	const now = new Date("2026-03-28T00:00:00.000Z");
	const email = "logout-test@example.com";
	const deviceId = "logout-test-device-id";
	let userId = 0;
	let sessionToken = "";

	beforeEach(async () => {
		mockCookies.mockClear();
		mockCookieStore.clear();

		const [user] = await db
			.insert(usersTable)
			.values({
				publicId: "logout-test-user",
			})
			.returning({ id: usersTable.id });

		await db.insert(userEmailsTable).values({
			userId: user.id,
			encryptedEmail: encrypt(email),
			emailHmac: computeHmac(email),
		});

		userId = user.id;
		sessionToken = await generateSessionToken({
			userId,
			deviceId,
		});

		await db.insert(sessionTokensTable).values({
			token: sessionToken,
			userId,
			deviceId,
			expiresAt: new Date("2026-04-27T00:00:00.000Z"),
			createdAt: now,
		});

		mockCookieStore.set(sessionToken);
	});

	it("現在有効なトークンがデータベースとCookieにあれば、削除してログアウト状態にする", async () => {
		const result = await logout();

		expect(result).toEqual({
			success: true,
		});

		expect(mockCookies).toHaveBeenCalled();

		const [savedSessionToken] = await db
			.select()
			.from(sessionTokensTable)
			.where(eq(sessionTokensTable.token, sessionToken));

		expect(savedSessionToken).toBeUndefined();

		const currentUserResult = await currentUserId();

		expect(currentUserResult).toEqual({
			success: false,
			error: {
				code: "UNAUTHORIZED_ERROR",
				message: "ログインしていません。",
			},
		});
	});

	it("ユーザーが2つのデバイスでログインしている場合、片方でログアウトしても片方はログイン状態が続く", async () => {
		const otherDeviceId = "logout-test-other-device-id";
		const otherSessionToken = await generateSessionToken({
			userId,
			deviceId: otherDeviceId,
		});

		await db.insert(sessionTokensTable).values({
			token: otherSessionToken,
			userId,
			deviceId: otherDeviceId,
			expiresAt: new Date("2026-04-27T00:00:00.000Z"),
			createdAt: now,
		});

		const result = await logout();

		expect(result).toEqual({
			success: true,
		});

		const [deletedSessionToken] = await db
			.select()
			.from(sessionTokensTable)
			.where(eq(sessionTokensTable.token, sessionToken));

		expect(deletedSessionToken).toBeUndefined();

		const [remainingSessionToken] = await db
			.select()
			.from(sessionTokensTable)
			.where(eq(sessionTokensTable.token, otherSessionToken));

		expect(remainingSessionToken).toBeDefined();
		if (!remainingSessionToken) {
			throw new Error("ログアウトしていない別デバイスのトークンが削除されています");
		}

		const otherDeviceCurrentUserResult = await verifySessionTokenService({
			sessionToken: otherSessionToken,
			now,
		});

		expect(otherDeviceCurrentUserResult).toEqual({
			success: true,
			data: {
				userId,
			},
		});
	});

	it("現在有効なトークンがデータベースとCookieになければ何もしない", async () => {
		mockCookieStore.clear();
		await db
			.delete(sessionTokensTable)
			.where(eq(sessionTokensTable.token, sessionToken));

		const result = await logout();

		expect(result).toEqual({
			success: true,
		});
		expect(mockCookies).toHaveBeenCalled();

		const [savedSessionToken] = await db
			.select()
			.from(sessionTokensTable)
			.where(eq(sessionTokensTable.token, sessionToken));

		expect(savedSessionToken).toBeUndefined();

		const currentUserResult = await currentUserId();

		expect(currentUserResult).toEqual({
			success: false,
			error: {
				code: "UNAUTHORIZED_ERROR",
				message: "ログインしていません。",
			},
		});
	});
});
