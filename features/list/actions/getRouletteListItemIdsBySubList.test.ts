import crypto from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
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
import { getRouletteListItemIdsBySubList } from "./getRouletteListItemIdsBySubList";

const { mockCurrentUserId } = vi.hoisted(() => ({
	mockCurrentUserId: vi.fn(),
}));

vi.mock("@/features/shared/actions/currentUserId", () => ({
	currentUserId: mockCurrentUserId,
}));

async function findStreamingServiceIdBySlug(slug: "netflix") {
	const [row] = await db
		.select({ id: streamingServicesTable.id })
		.from(streamingServicesTable)
		.where(eq(streamingServicesTable.slug, slug));
	if (!row) throw new Error(`${slug} not found`);
	return row.id;
}

describe("getRouletteListItemIdsBySubList", () => {
	let userId = 0;
	let listId = 0;
	let subListPublicId = "";
	let listItemPublicId1 = "";
	let listItemPublicId2 = "";

	beforeEach(async () => {
		await db.delete(listItemsTable);
		await db.delete(listsTable);
		await db.delete(usersTable);

		const [user] = await db
			.insert(usersTable)
			.values({ publicId: "get-roulette-list-item-ids-by-sub-list-user" })
			.returning({ id: usersTable.id });

		userId = user.id;

		const [list] = await db
			.insert(listsTable)
			.values({ publicId: crypto.randomUUID(), userId })
			.returning({ id: listsTable.id });

		listId = list.id;

		const netflixId = await findStreamingServiceIdBySlug("netflix");
		listItemPublicId1 = crypto.randomUUID();
		listItemPublicId2 = crypto.randomUUID();

		const [item1] = await db
			.insert(listItemsTable)
			.values({
				publicId: listItemPublicId1,
				listId,
				streamingServiceId: netflixId,
				watchUrl: "https://www.netflix.com/jp/title/1",
				titleOnService: "テスト映画1",
				createdAt: new Date(),
			})
			.returning({ id: listItemsTable.id });

		const [item2] = await db
			.insert(listItemsTable)
			.values({
				publicId: listItemPublicId2,
				listId,
				streamingServiceId: netflixId,
				watchUrl: "https://www.netflix.com/jp/title/2",
				titleOnService: "テスト映画2",
				createdAt: new Date(),
			})
			.returning({ id: listItemsTable.id });

		subListPublicId = crypto.randomUUID();
		const [subList] = await db
			.insert(subListsTable)
			.values({
				publicId: subListPublicId,
				listId,
				name: "テストサブリスト",
				createdAt: new Date(),
			})
			.returning({ id: subListsTable.id });

		await db.insert(subListItemsTable).values([
			{ subListId: subList.id, listItemId: item1.id },
			{ subListId: subList.id, listItemId: item2.id },
		]);
	});

	it("自身のサブリストのアイテムpublicId配列を返す", async () => {
		mockCurrentUserId.mockResolvedValue({ success: true, data: { userId } });

		const result = await getRouletteListItemIdsBySubList(subListPublicId);

		expect(result.success).toBe(true);
		if (!result.success) return;
		expect(result.data).toHaveLength(2);
		expect(result.data).toContain(listItemPublicId1);
		expect(result.data).toContain(listItemPublicId2);
	});

	it("存在しないサブリストでは NOT_FOUND_ERROR を返す", async () => {
		mockCurrentUserId.mockResolvedValue({ success: true, data: { userId } });

		const result = await getRouletteListItemIdsBySubList(crypto.randomUUID());

		expect(result).toEqual({
			success: false,
			error: { code: "NOT_FOUND_ERROR", message: "サブリストが見つかりませんでした。" },
		});
	});

	it("他ユーザーのサブリストでは NOT_FOUND_ERROR を返す", async () => {
		const [otherUser] = await db
			.insert(usersTable)
			.values({ publicId: "other-user" })
			.returning({ id: usersTable.id });

		mockCurrentUserId.mockResolvedValue({
			success: true,
			data: { userId: otherUser.id },
		});

		const result = await getRouletteListItemIdsBySubList(subListPublicId);

		expect(result).toEqual({
			success: false,
			error: { code: "NOT_FOUND_ERROR", message: "サブリストが見つかりませんでした。" },
		});
	});

	it("未認証ユーザーは UNAUTHORIZED_ERROR を返す", async () => {
		mockCurrentUserId.mockResolvedValue({ success: false });

		const result = await getRouletteListItemIdsBySubList(subListPublicId);

		expect(result).toEqual({
			success: false,
			error: { code: "UNAUTHORIZED_ERROR", message: "ログインかユーザー登録をしてください。" },
		});
	});
});
