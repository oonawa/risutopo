import crypto from "node:crypto";
import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/db/client";
import {
	listItemsTable,
	listsTable,
	streamingServicesTable,
	subListItemsTable,
	subListsTable,
	usersTable,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { removeSubListItem } from "./removeSubListItem";

async function findStreamingServiceIdBySlug(slug: "netflix") {
	const [row] = await db
		.select({ id: streamingServicesTable.id })
		.from(streamingServicesTable)
		.where(eq(streamingServicesTable.slug, slug));
	if (!row) throw new Error(`${slug} not found`);
	return row.id;
}

describe("removeSubListItem", () => {
	let subListPublicId = "";
	let listItemPublicId = "";
	let subListId = 0;
	let listItemId = 0;

	beforeEach(async () => {
		await db.delete(listItemsTable);
		await db.delete(listsTable);
		await db.delete(usersTable);

		const [user] = await db
			.insert(usersTable)
			.values({ publicId: "remove-sub-list-item-user" })
			.returning({ id: usersTable.id });

		const [list] = await db
			.insert(listsTable)
			.values({ publicId: crypto.randomUUID(), userId: user.id })
			.returning({ id: listsTable.id });

		const netflixId = await findStreamingServiceIdBySlug("netflix");
		listItemPublicId = crypto.randomUUID();

		const [listItem] = await db
			.insert(listItemsTable)
			.values({
				publicId: listItemPublicId,
				listId: list.id,
				streamingServiceId: netflixId,
				watchUrl: "https://www.netflix.com/jp/title/99999",
				titleOnService: "削除テスト映画",
				createdAt: new Date(),
			})
			.returning({ id: listItemsTable.id });

		listItemId = listItem.id;

		subListPublicId = crypto.randomUUID();
		const [subList] = await db
			.insert(subListsTable)
			.values({
				publicId: subListPublicId,
				listId: list.id,
				name: "削除テストサブリスト",
				createdAt: new Date(),
			})
			.returning({ id: subListsTable.id });

		subListId = subList.id;

		await db
			.insert(subListItemsTable)
			.values({ subListId, listItemId });
	});

	it("サブリストからアイテムを削除できる", async () => {
		const result = await removeSubListItem({
			subListPublicId,
			listItemPublicId,
		});

		expect(result).toEqual({ success: true });

		const items = await db
			.select()
			.from(subListItemsTable)
			.where(eq(subListItemsTable.subListId, subListId));
		expect(items).toHaveLength(0);
	});

	it("不正な subListPublicId では VALIDATION_ERROR を返す", async () => {
		const result = await removeSubListItem({
			subListPublicId: "not-a-uuid",
			listItemPublicId,
		});

		expect(result).toEqual({
			success: false,
			error: {
				code: "VALIDATION_ERROR",
				message: "不正なリクエストです。",
			},
		});
	});

	it("存在しないサブリストでは NOT_FOUND_ERROR を返す", async () => {
		const result = await removeSubListItem({
			subListPublicId: crypto.randomUUID(),
			listItemPublicId,
		});

		expect(result).toEqual({
			success: false,
			error: {
				code: "NOT_FOUND_ERROR",
				message: "サブリストが見つかりませんでした。",
			},
		});
	});
});
