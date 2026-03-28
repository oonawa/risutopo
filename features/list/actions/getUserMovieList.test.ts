import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/db/client";
import {
	listItemsTable,
	listsTable,
	streamingServicesTable,
	userEmailsTable,
	usersTable,
	watchedItemsTable,
} from "@/db/schema";
import { getUserMovieList } from "./getUserMovieList";

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

describe("getUserMovieList", () => {
	let userAId = 0;
	let userBId = 0;
	let userAPublicListId = "";
	let userBPublicListId = "";

	beforeEach(async () => {
		await db.delete(listItemsTable);
		await db.delete(listsTable);
		await db.delete(usersTable);

		const [userA] = await db
			.insert(usersTable)
			.values({
				publicId: "get-user-movie-list-user-a",
			})
			.returning({ id: usersTable.id });
		await db.insert(userEmailsTable).values({
			userId: userA.id,
			email: "get-user-movie-list-user-a@example.com",
		});

		const [userB] = await db
			.insert(usersTable)
			.values({
				publicId: "get-user-movie-list-user-b",
			})
			.returning({ id: usersTable.id });
		await db.insert(userEmailsTable).values({
			userId: userB.id,
			email: "get-user-movie-list-user-b@example.com",
		});

		userAId = userA.id;
		userBId = userB.id;

		userAPublicListId = crypto.randomUUID();
		userBPublicListId = crypto.randomUUID();

		const [userAList] = await db
			.insert(listsTable)
			.values({
				publicId: userAPublicListId,
				userId: userAId,
			})
			.returning({ id: listsTable.id });

		const [userBList] = await db
			.insert(listsTable)
			.values({
				publicId: userBPublicListId,
				userId: userBId,
			})
			.returning({ id: listsTable.id });

		const netflixId = await findStreamingServiceIdBySlug("netflix");
		const huluId = await findStreamingServiceIdBySlug("hulu");

		const insertedListItems = await db
			.insert(listItemsTable)
			.values([
				{
					publicId: "get-user-movie-list-user-a-item-1",
					listId: userAList.id,
					streamingServiceId: netflixId,
					watchUrl: "https://www.netflix.com/jp/title/60002360",
					titleOnService: "ユーザーAの映画1",
					createdAt: new Date("2026-03-12T00:00:00.000Z"),
				},
				{
					publicId: "get-user-movie-list-user-a-item-2",
					listId: userAList.id,
					streamingServiceId: huluId,
					watchUrl: "https://www.hulu.jp/watch/test-user-a",
					titleOnService: "ユーザーAの映画2",
					createdAt: new Date("2026-03-11T00:00:00.000Z"),
				},
				{
					publicId: "get-user-movie-list-user-b-item-1",
					listId: userBList.id,
					streamingServiceId: netflixId,
					watchUrl: "https://www.netflix.com/jp/title/80100172",
					titleOnService: "ユーザーBの映画1",
					createdAt: new Date("2026-03-10T00:00:00.000Z"),
				},
			])
			.returning({
				id: listItemsTable.id,
				publicId: listItemsTable.publicId,
			});

		const watchedListItem = insertedListItems.find(
			(item) => item.publicId === "get-user-movie-list-user-a-item-2",
		);

		if (!watchedListItem) {
			throw Error("視聴済みテストデータの作成に失敗しました");
		}

		await db.insert(watchedItemsTable).values({
			listItemId: watchedListItem.id,
			watchedAt: new Date("2026-03-11T00:00:00.000Z"),
		});
	});

	it("ユーザーは自身のリストアイテム全件を取得できる", async () => {
		const result = await getUserMovieList(userAPublicListId, userAId);

		expect(result).toEqual({
			success: true,
			data: [
				{
					listItemId: "get-user-movie-list-user-a-item-2",
					title: "ユーザーAの映画2",
					url: "https://www.hulu.jp/watch/test-user-a",
					serviceSlug: "hulu",
					serviceName: "Hulu",
					isWatched: true,
					watchedAt: new Date("2026-03-11T00:00:00.000Z"),
					createdAt: new Date("2026-03-11T00:00:00.000Z"),
				},
				{
					listItemId: "get-user-movie-list-user-a-item-1",
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
		const result = await getUserMovieList(userBPublicListId, userAId);

		expect(result).toEqual({
			success: false,
			error: {
				code: "NOT_FOUND_ERROR",
				message: "リストが見つかりませんでした。",
			},
		});
	});

	it("ユーザーは存在しないリストからリストアイテムを取得できない", async () => {
		const result = await getUserMovieList(crypto.randomUUID(), userAId);

		expect(result).toEqual({
			success: false,
			error: {
				code: "NOT_FOUND_ERROR",
				message: "リストが見つかりませんでした。",
			},
		});
	});

	it("不正なリクエストではリストアイテムを取得できない", async () => {
		const result = await getUserMovieList("invalid-list-public-id", userAId);

		expect(result).toEqual({
			success: false,
			error: {
				code: "VALIDATION_ERROR",
				message: "不正なリクエストです。",
			},
		});
	});
});
