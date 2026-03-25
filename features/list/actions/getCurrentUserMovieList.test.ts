import crypto from "node:crypto";
import { SignJWT } from "jose";
import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/db/client";
import {
	listItemsTable,
	listsTable,
	sessionTokensTable,
	streamingServicesTable,
	userEmailsTable,
	usersTable,
	watchedItemsTable,
} from "@/db/schema";
import { getSecretKey } from "@/lib/jwt";
import { getCurrentUserMovieList } from "./getCurrentUserMovieList";

const { mockCookies, mockSessionTokenStore } = vi.hoisted(() => {
	let sessionToken: string | undefined;

	return {
		mockCookies: vi.fn(async () => ({
			get: (name: string) => {
				if (name !== "session_token" || !sessionToken) {
					return undefined;
				}

				return { value: sessionToken };
			},
		})),
		mockSessionTokenStore: {
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

async function findStreamingServiceIdBySlug(slug: "netflix" | "hulu") {
	const [streamingService] = await db
		.select({ id: streamingServicesTable.id })
		.from(streamingServicesTable)
		.where(eq(streamingServicesTable.slug, slug));

	expect(streamingService).toBeDefined();

	if (!streamingService) {
		throw Error(`streaming_services_table に ${slug} が存在しません`);
	}

	return streamingService.id;
}

async function generateSessionToken({
	userId,
	email,
	deviceId,
}: {
	userId: number;
	email: string;
	deviceId: string;
}) {
	return await new SignJWT({
		userId: userId.toString(),
		email,
		deviceId,
		type: "session_token",
	})
		.setProtectedHeader({ alg: "HS256" })
		.setExpirationTime("30d")
		.setIssuedAt()
		.sign(getSecretKey());
}

async function loginAsUser({
	userId,
	email,
	now,
}: {
	userId: number;
	email: string;
	now: Date;
}) {
	const sessionToken = await generateSessionToken({
		userId,
		email,
		deviceId: "test-device-id",
	});

	await db.insert(sessionTokensTable).values({
		token: sessionToken,
		email,
		userId,
		deviceId: "test-device-id",
		expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
		createdAt: now,
	});

	mockSessionTokenStore.set(sessionToken);
}

describe("getCurrentUserMovieList", () => {
	let userAId = 0;
	let userBId = 0;
	let userAListPublicId = "";
	let userBListPublicId = "";
	const now = new Date("2026-03-12T00:00:00.000Z");

	beforeEach(async () => {
		mockCookies.mockClear();
		mockSessionTokenStore.clear();

		await db.delete(sessionTokensTable);
		await db.delete(listItemsTable);
		await db.delete(listsTable);
		await db.delete(usersTable);

		const [userA] = await db
			.insert(usersTable)
			.values({
				publicId: "get-current-user-movie-list-user-a",
			})
			.returning({ id: usersTable.id });
		await db.insert(userEmailsTable).values({
			userId: userA.id,
			email: "get-current-user-movie-list-user-a@example.com",
		});

		const [userB] = await db
			.insert(usersTable)
			.values({
				publicId: "get-current-user-movie-list-user-b",
			})
			.returning({ id: usersTable.id });
		await db.insert(userEmailsTable).values({
			userId: userB.id,
			email: "get-current-user-movie-list-user-b@example.com",
		});

		userAId = userA.id;
		userBId = userB.id;

		userAListPublicId = crypto.randomUUID();
		userBListPublicId = crypto.randomUUID();

		const [userAList] = await db
			.insert(listsTable)
			.values({
				publicId: userAListPublicId,
				userId: userAId,
			})
			.returning({ id: listsTable.id });

		const [userBList] = await db
			.insert(listsTable)
			.values({
				publicId: userBListPublicId,
				userId: userBId,
			})
			.returning({ id: listsTable.id });

		const netflixId = await findStreamingServiceIdBySlug("netflix");
		const huluId = await findStreamingServiceIdBySlug("hulu");

		const insertedListItems = await db.insert(listItemsTable).values([
			{
				publicId: "get-current-user-movie-list-user-a-item-1",
				listId: userAList.id,
				streamingServiceId: netflixId,
				watchUrl: "https://www.netflix.com/jp/title/60002360",
				titleOnService: "ユーザーAの映画1",
				createdAt: new Date("2026-03-12T00:00:00.000Z"),
			},
			{
				publicId: "get-current-user-movie-list-user-a-item-2",
				listId: userAList.id,
				streamingServiceId: huluId,
				watchUrl: "https://www.hulu.jp/watch/test-user-a",
				titleOnService: "ユーザーAの映画2",
				createdAt: new Date("2026-03-11T00:00:00.000Z"),
			},
			{
				publicId: "get-current-user-movie-list-user-b-item-1",
				listId: userBList.id,
				streamingServiceId: netflixId,
				watchUrl: "https://www.netflix.com/jp/title/80100172",
				titleOnService: "ユーザーBの映画1",
				createdAt: new Date("2026-03-10T00:00:00.000Z"),
			},
		]).returning({
			id: listItemsTable.id,
			publicId: listItemsTable.publicId,
		});

		const watchedListItem = insertedListItems.find(
			(item) => item.publicId === "get-current-user-movie-list-user-a-item-2",
		);

		if (!watchedListItem) {
			throw Error("視聴済みテストデータの作成に失敗しました");
		}

		await db.insert(watchedItemsTable).values({
			listItemId: watchedListItem.id,
			watchedAt: new Date("2026-03-11T00:00:00.000Z"),
		});
	});

	it("ログイン中ユーザーは自身のリストアイテム全件を取得できる", async () => {
		await loginAsUser({
			userId: userAId,
			email: "get-current-user-movie-list-user-a@example.com",
			now,
		});

		const result = await getCurrentUserMovieList(userAListPublicId);

		expect(mockCookies).toHaveBeenCalledTimes(1);
		expect(result).toEqual({
			success: true,
			data: [
				{
					listItemId: "get-current-user-movie-list-user-a-item-2",
					title: "ユーザーAの映画2",
					url: "https://www.hulu.jp/watch/test-user-a",
					serviceSlug: "hulu",
					serviceName: "Hulu",
					isWatched: true,
					watchedAt: new Date("2026-03-11T00:00:00.000Z"),
					createdAt: new Date("2026-03-11T00:00:00.000Z"),
				},
				{
					listItemId: "get-current-user-movie-list-user-a-item-1",
					title: "ユーザーAの映画1",
					url: "https://www.netflix.com/jp/title/60002360",
					serviceSlug: "netflix",
					serviceName: "Netflix",
					isWatched: false,
					watchedAt: null,
					createdAt: new Date("2026-03-12T00:00:00.000Z"),
				},
			],
		});
	});

	it("ユーザーは他ユーザーのリストアイテムを取得できない", async () => {
		await loginAsUser({
			userId: userAId,
			email: "get-current-user-movie-list-user-a@example.com",
			now,
		});

		const result = await getCurrentUserMovieList(userBListPublicId);

		expect(result).toEqual({
			success: false,
			error: {
				code: "NOT_FOUND_ERROR",
				message: "リストが見つかりませんでした。",
			},
		});
	});

	it("ユーザーはログイン中でなければリストアイテムを取得できない", async () => {
		const result = await getCurrentUserMovieList(userAListPublicId);

		expect(mockCookies).toHaveBeenCalledTimes(1);
		expect(result).toEqual({
			success: false,
			error: {
				code: "UNAUTHORIZED_ERROR",
				message: "ログインかユーザー登録をしてください。",
			},
		});
	});

	it("ユーザーは存在しないリストからリストアイテムを取得できない", async () => {
		await loginAsUser({
			userId: userAId,
			email: "get-current-user-movie-list-user-a@example.com",
			now,
		});

		const result = await getCurrentUserMovieList(crypto.randomUUID());

		expect(result).toEqual({
			success: false,
			error: {
				code: "NOT_FOUND_ERROR",
				message: "リストが見つかりませんでした。",
			},
		});
	});
});
