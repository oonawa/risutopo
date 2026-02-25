import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/db/client";
import {
	listItemsTable,
	listsTable,
	streamingServicesTable,
	usersTable,
} from "@/db/schema";
import { removeListItem } from "./removeListItem";

describe("removeListItem", () => {
	let testListId: number;
	let testStreamingServiceId: number;

	beforeEach(async () => {
		const [user] = await db
			.insert(usersTable)
			.values({
				publicId: "remove-list-item-test-user",
				email: "remove-list-item-test@risutopo.com",
			})
			.returning({ id: usersTable.id });

		const [list] = await db
			.insert(listsTable)
			.values({ userId: user.id })
			.returning({ id: listsTable.id });

		const [streamingService] = await db
			.select({ id: streamingServicesTable.id })
			.from(streamingServicesTable)
			.where(eq(streamingServicesTable.slug, "netflix"));

		if (!streamingService) {
			throw Error("streaming_services_table に netflix が存在しません");
		}

		testListId = list.id;
		testStreamingServiceId = streamingService.id;
	});

	it("指定した list_items_table.publicId のレコードを削除できる", async () => {
		const listItemPublicId = "remove-list-item-target";

		await db.insert(listItemsTable).values({
			publicId: listItemPublicId,
			listId: testListId,
			streamingServiceId: testStreamingServiceId,
			watchUrl: "https://www.netflix.com/jp/title/80100172",
			titleOnService: "テスト映画",
			watchStatus: 0,
			createdAt: new Date(),
			movieId: null,
		});

		const result = await removeListItem({ listItemId: listItemPublicId });
		expect(result).toEqual({ success: true });

		const records = await db
			.select({ id: listItemsTable.id })
			.from(listItemsTable)
			.where(eq(listItemsTable.publicId, listItemPublicId));
		expect(records).toHaveLength(0);
	});

	it("対象の publicId が存在しない場合はエラーを返す", async () => {
		const result = await removeListItem({ listItemId: "not-found-public-id" });

		expect(result.success).toBe(false);
		if (result.success) {
			return;
		}

		expect(result.error.message).toBe("作品がリストへ登録されていないか、すでに削除されています。");
	});
});
