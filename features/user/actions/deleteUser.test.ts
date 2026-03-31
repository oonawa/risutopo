import crypto from "node:crypto";
import { eq, inArray } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/db/client";
import {
	reauthTokensTable,
	deletedUsersTable,
	listItemsTable,
	listsTable,
	sessionTokensTable,
	streamingServicesTable,
	userEmailsTable,
	usersTable,
} from "@/db/schema";
import { verifySessionTokenService } from "@/features/auth/services/verifySessionTokenService";
import { currentUserId } from "@/features/shared/actions/currentUserId";
import { generateSessionToken } from "@/features/shared/lib/jwt";
import { deleteUser } from "./deleteUser";
import { computeHmac, encrypt } from "@/features/shared/lib/encryption";

const { mockCookies, mockCookieStore } = vi.hoisted(() => {
	const store = new Map<string, string>();

	return {
		mockCookies: vi.fn(async () => ({
			get: (name: string) => {
				const value = store.get(name);
				if (value === undefined) return undefined;
				return { value };
			},
			delete: (name: string) => {
				store.delete(name);
			},
		})),
		mockCookieStore: {
			clear() {
				store.clear();
			},
			set(name: string, value: string) {
				store.set(name, value);
			},
		},
	};
});

vi.mock("next/headers", () => ({
	cookies: mockCookies,
}));

describe("deleteUser", () => {
	const now = new Date("2026-03-28T00:00:00.000Z");
	const email = "delete-user-test@example.com";
	const publicUserId = "delete-user-test-user";
	const deviceId = "delete-user-test-device-id";
	let userId = 0;
	let sessionToken = "";
	let deleteIntentToken = "";
	let listItemPublicId = "";

	beforeEach(async () => {
		vi.useFakeTimers();
		vi.setSystemTime(now);
		mockCookies.mockClear();
		mockCookieStore.clear();

		const [user] = await db
			.insert(usersTable)
			.values({ publicId: publicUserId })
			.returning({
				id: usersTable.id,
			});

		await db.insert(userEmailsTable).values({
			userId: user.id,
			email: encrypt(email),
			emailHmac: computeHmac(email),
		});

		const [list] = await db
			.insert(listsTable)
			.values({
				publicId: crypto.randomUUID(),
				userId: user.id,
			})
			.returning({
				id: listsTable.id,
			});

		const [streamingService] = await db
			.select({ id: streamingServicesTable.id })
			.from(streamingServicesTable)
			.where(eq(streamingServicesTable.slug, "netflix"));

		if (!streamingService) {
			throw Error("streaming_services_table に netflix が存在しません");
		}

		listItemPublicId = crypto.randomUUID();
		await db.insert(listItemsTable).values({
			publicId: listItemPublicId,
			listId: list.id,
			streamingServiceId: streamingService.id,
			watchUrl: "https://www.netflix.com/jp/title/80100172",
			titleOnService: "退会テスト作品",
			createdAt: now,
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

		deleteIntentToken = crypto.randomBytes(32).toString("hex");
		await db.insert(reauthTokensTable).values({
			token: deleteIntentToken,
			userId,
			expiresAt: new Date("2026-03-28T00:15:00.000Z"),
			createdAt: now,
		});

		mockCookieStore.set("session_token", sessionToken);
		mockCookieStore.set("delete_account_reauth_token", deleteIntentToken);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	async function expectUserDeletionSideEffects({
		expectedDeletedTokens,
	}: {
		expectedDeletedTokens: string[];
	}) {
		expect(mockCookies).toHaveBeenCalled();

		const remainingTokens = await db
			.select()
			.from(sessionTokensTable)
			.where(inArray(sessionTokensTable.token, expectedDeletedTokens));

		expect(remainingTokens).toHaveLength(0);

		const currentUserResult = await currentUserId();

		expect(currentUserResult).toEqual({
			success: false,
			error: {
				code: "UNAUTHORIZED_ERROR",
				message: "ログインしていません。",
			},
		});

		const [deletedUser] = await db
			.select({
				publicId: deletedUsersTable.publicId,
				deletedAt: deletedUsersTable.deletedAt,
			})
			.from(deletedUsersTable)
			.where(eq(deletedUsersTable.publicId, publicUserId));

		expect(deletedUser).toEqual({
			publicId: publicUserId,
			deletedAt: now,
		});

		const [savedUser] = await db
			.select({
				id: usersTable.id,
			})
			.from(usersTable)
			.where(eq(usersTable.id, userId));

		expect(savedUser).toBeUndefined();

		const [savedListItem] = await db
			.select({
				id: listItemsTable.id,
			})
			.from(listItemsTable)
			.where(eq(listItemsTable.publicId, listItemPublicId));

		expect(savedListItem).toBeUndefined();
	}

	it("ログイン中ユーザーの場合、ログアウト状態にして退会済みユーザーテーブルへpublicIdと退会日を格納する", async () => {
		const result = await deleteUser();

		expect(result).toEqual({
			success: true,
		});

		await expectUserDeletionSideEffects({
			expectedDeletedTokens: [sessionToken],
		});
	});

	it("ユーザーが複数デバイスでログインしている場合、すべてのセッションが削除される", async () => {
		const otherDeviceId = "delete-user-test-other-device-id";
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

		const result = await deleteUser();

		expect(result).toEqual({
			success: true,
		});

		await expectUserDeletionSideEffects({
			expectedDeletedTokens: [sessionToken, otherSessionToken],
		});

		const otherDeviceCurrentUserResult = await verifySessionTokenService({
			sessionToken: otherSessionToken,
			now,
		});

		expect(otherDeviceCurrentUserResult).toEqual({
			success: false,
			error: {
				code: "UNAUTHORIZED_ERROR",
				message: "",
			},
		});
	});

	it("未ログインユーザーの場合、認証エラーを返す", async () => {
		mockCookieStore.clear();
		await db
			.delete(sessionTokensTable)
			.where(eq(sessionTokensTable.token, sessionToken));

		const result = await deleteUser();

		expect(result).toEqual({
			success: false,
			error: {
				code: "UNAUTHORIZED_ERROR",
				message: "ログインしていません。",
			},
		});

		const [deletedUser] = await db
			.select()
			.from(deletedUsersTable)
			.where(eq(deletedUsersTable.publicId, publicUserId));

		expect(deletedUser).toBeUndefined();
	});

	it("delete_account_reauth_token がない場合、認証エラーを返す", async () => {
		mockCookieStore.clear();
		mockCookieStore.set("session_token", sessionToken);
		// delete_account_reauth_token はセットしない

		const result = await deleteUser();

		expect(result).toEqual({
			success: false,
			error: {
				code: "UNAUTHORIZED_ERROR",
				message: "アカウント削除の認証が必要です。",
			},
		});

		const [deletedUser] = await db
			.select()
			.from(deletedUsersTable)
			.where(eq(deletedUsersTable.publicId, publicUserId));

		expect(deletedUser).toBeUndefined();
	});

	it("delete_account_reauth_token が有効期限切れの場合、認証エラーを返す", async () => {
		const expiredToken = crypto.randomBytes(32).toString("hex");
		await db.insert(reauthTokensTable).values({
			token: expiredToken,
			userId,
			expiresAt: new Date(now.getTime() - 1),
			createdAt: now,
		});
		mockCookieStore.set("delete_account_reauth_token", expiredToken);

		const result = await deleteUser();

		expect(result).toEqual({
			success: false,
			error: {
				code: "UNAUTHORIZED_ERROR",
				message: "再認証が無効です。もう一度お試しください。",
			},
		});

		const [deletedUser] = await db
			.select()
			.from(deletedUsersTable)
			.where(eq(deletedUsersTable.publicId, publicUserId));

		expect(deletedUser).toBeUndefined();
	});

	it("session_token と delete_account_reauth_token のユーザーが異なる場合、FORBIDDEN_ERROR を返す", async () => {
		const [otherUser] = await db
			.insert(usersTable)
			.values({ publicId: "delete-user-test-other-user" })
			.returning({ id: usersTable.id });

		const otherReauthToken = crypto.randomBytes(32).toString("hex");
		await db.insert(reauthTokensTable).values({
			token: otherReauthToken,
			userId: otherUser.id,
			expiresAt: new Date("2026-03-28T00:15:00.000Z"),
			createdAt: now,
		});
		mockCookieStore.set("delete_account_reauth_token", otherReauthToken);

		const result = await deleteUser();

		expect(result).toEqual({
			success: false,
			error: {
				code: "FORBIDDEN_ERROR",
				message: "アカウント削除の認証が無効です。",
			},
		});

		const [deletedUser] = await db
			.select()
			.from(deletedUsersTable)
			.where(eq(deletedUsersTable.publicId, publicUserId));

		expect(deletedUser).toBeUndefined();
	});
});
