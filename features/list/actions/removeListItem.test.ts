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
			})
			.returning({ id: usersTable.id });
		await db.insert(userEmailsTable).values({
			userId: user.id,
			email: "remove-list-item-test@risutopo.com",
		});

		const [list] = await db
			.insert(listsTable)
			.values({ publicId: crypto.randomUUID(), userId: user.id })
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

	it("リスト内作品を削除できる", async () => {
		const listItemPublicId = crypto.randomUUID();

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

	it("無効な入力値に対してはVALIDATION_ERRORを返す", async () => {
		const result = await removeListItem({ listItemId: "" });

		expect(result.success).toBe(false);
		if (result.success) {
			return;
		}

		expect(result.error.message).toBe("不正なリクエストです。");
	});

	it("対象のリスト内作品が存在しない場合はNOT_FOUND_ERRORを返す", async () => {
		const result = await removeListItem({ listItemId: crypto.randomUUID() });

		expect(result.success).toBe(false);
		if (result.success) {
			return;
		}

		expect(result.error.message).toBe(
			"作品がリストへ登録されていないか、すでに削除されています。",
		);
	});
});
