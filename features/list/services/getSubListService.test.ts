import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/db/client";
import {
	listItemsTable,
	listsTable,
	streamingServicesTable,
	subListItemsTable,
	subListsTable,
	usersTable,
	watchedItemsTable,
} from "@/db/schema";
import { getSubListService } from "./getSubListService";

async function findStreamingServiceIdBySlug(slug: "netflix" | "hulu") {
	const [streamingService] = await db
		.select({ id: streamingServicesTable.id })
		.from(streamingServicesTable)
		.where(eq(streamingServicesTable.slug, slug));

	if (!streamingService) {
		throw Error(`streaming_services_table に ${slug} が存在しません`);
	}

	return streamingService.id;
}

describe("getSubListService", () => {
	let userId = 0;
	let listId = 0;
	let subListId = 0;

	beforeEach(async () => {
		await db.delete(subListItemsTable);
		await db.delete(subListsTable);
		await db.delete(listItemsTable);
		await db.delete(listsTable);
		await db.delete(usersTable);

		const [user] = await db
			.insert(usersTable)
			.values({ publicId: "get-sub-list-service-user" })
			.returning({ id: usersTable.id });
		userId = user.id;

		const [list] = await db
			.insert(listsTable)
			.values({ publicId: crypto.randomUUID(), userId })
			.returning({ id: listsTable.id });
		listId = list.id;

		const [subList] = await db
			.insert(subListsTable)
			.values({
				publicId: crypto.randomUUID(),
				listId,
				name: "テストサブリスト",
				createdAt: new Date(),
			})
			.returning({ id: subListsTable.id });
		subListId = subList.id;
	});

	it("サブリストのアイテム一覧を取得できる", async () => {
		const netflixId = await findStreamingServiceIdBySlug("netflix");
		const huluId = await findStreamingServiceIdBySlug("hulu");

		const insertedItems = await db
			.insert(listItemsTable)
			.values([
				{
					publicId: "get-sub-list-service-item-1",
					listId,
					streamingServiceId: netflixId,
					watchUrl: "https://www.netflix.com/jp/title/sublist-service-1",
					titleOnService: "サブリスト映画1",
					createdAt: new Date("2026-03-12T00:00:00.000Z"),
				},
				{
					publicId: "get-sub-list-service-item-2",
					listId,
					streamingServiceId: huluId,
					watchUrl: "https://www.hulu.jp/watch/sublist-service-2",
					titleOnService: "サブリスト映画2",
					createdAt: new Date("2026-03-11T00:00:00.000Z"),
				},
			])
			.returning({ id: listItemsTable.id, publicId: listItemsTable.publicId });

		const item1 = insertedItems.find(
			(i) => i.publicId === "get-sub-list-service-item-1",
		);
		const item2 = insertedItems.find(
			(i) => i.publicId === "get-sub-list-service-item-2",
		);

		if (!item1 || !item2) {
			throw Error("テストデータの作成に失敗しました");
		}

		await db.insert(subListItemsTable).values([
			{ subListId, listItemId: item1.id },
			{ subListId, listItemId: item2.id },
		]);

		await db.insert(watchedItemsTable).values({
			listItemId: item2.id,
			watchedAt: new Date("2026-03-11T00:00:00.000Z"),
		});

		const result = await getSubListService(subListId, userId);

		expect(result.success).toBe(true);

		if (!result.success) return;

		expect(result.data).toHaveLength(2);

		const titles = result.data.map((item) => item.title);
		expect(titles).toContain("サブリスト映画1");
		expect(titles).toContain("サブリスト映画2");

		const item2Result = result.data.find(
			(item) => item.listItemId === "get-sub-list-service-item-2",
		);
		expect(item2Result?.isWatched).toBe(true);
	});

	it("サブリストが空の場合、空配列を返す", async () => {
		const result = await getSubListService(subListId, userId);

		expect(result).toEqual({ success: true, data: [] });
	});
});
