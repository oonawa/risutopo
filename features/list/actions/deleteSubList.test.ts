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
import { deleteSubList } from "./deleteSubList";

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

describe("deleteSubList", () => {
	let userId = 0;
	let otherUserId = 0;
	let subListPublicId = "";
	let subListId = 0;

	beforeEach(async () => {
		await db.delete(listItemsTable);
		await db.delete(listsTable);
		await db.delete(usersTable);

		const [user] = await db
			.insert(usersTable)
			.values({ publicId: "delete-sub-list-user" })
			.returning({ id: usersTable.id });
		userId = user.id;

		const [otherUser] = await db
			.insert(usersTable)
			.values({ publicId: "delete-sub-list-other-user" })
			.returning({ id: usersTable.id });
		otherUserId = otherUser.id;

		const [list] = await db
			.insert(listsTable)
			.values({ publicId: crypto.randomUUID(), userId })
			.returning({ id: listsTable.id });

		await db
			.insert(listsTable)
			.values({ publicId: crypto.randomUUID(), userId: otherUserId });

		const netflixId = await findStreamingServiceIdBySlug("netflix");
		const [listItem] = await db
			.insert(listItemsTable)
			.values({
				publicId: crypto.randomUUID(),
				listId: list.id,
				streamingServiceId: netflixId,
				watchUrl: "https://www.netflix.com/jp/title/99999",
				titleOnService: "削除テスト映画",
				createdAt: new Date(),
			})
			.returning({ id: listItemsTable.id });

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
			.values({ subListId, listItemId: listItem.id });
	});

	it("自分のサブリストを削除できる", async () => {
		mockCurrentUserId.mockResolvedValue({ success: true, data: { userId } });

		const result = await deleteSubList({ subListPublicId });

		expect(result).toEqual({ success: true });

		const subLists = await db
			.select()
			.from(subListsTable)
			.where(eq(subListsTable.id, subListId));
		expect(subLists).toHaveLength(0);

		const subListItems = await db
			.select()
			.from(subListItemsTable)
			.where(eq(subListItemsTable.subListId, subListId));
		expect(subListItems).toHaveLength(0);
	});

	it("未ログインのユーザーはサブリストを削除できない", async () => {
		mockCurrentUserId.mockResolvedValue({ success: false });

		const result = await deleteSubList({ subListPublicId });

		expect(result).toEqual({
			success: false,
			error: {
				code: "UNAUTHORIZED_ERROR",
				message: "ログインかユーザー登録をしてください。",
			},
		});

		const subLists = await db
			.select()
			.from(subListsTable)
			.where(eq(subListsTable.id, subListId));
		expect(subLists).toHaveLength(1);
	});

	it("UUID でないサブリスト ID は受け付けない", async () => {
		const result = await deleteSubList({ subListPublicId: "not-a-uuid" });

		expect(result).toEqual({
			success: false,
			error: {
				code: "VALIDATION_ERROR",
				message: "不正なリクエストです。",
			},
		});
	});

	it("存在しないサブリストは削除できない", async () => {
		mockCurrentUserId.mockResolvedValue({ success: true, data: { userId } });

		const result = await deleteSubList({
			subListPublicId: crypto.randomUUID(),
		});

		expect(result).toEqual({
			success: false,
			error: {
				code: "NOT_FOUND_ERROR",
				message: "サブリストが見つかりませんでした。",
			},
		});
	});

	it("他のユーザーのサブリストは削除できない", async () => {
		mockCurrentUserId.mockResolvedValue({
			success: true,
			data: { userId: otherUserId },
		});

		const result = await deleteSubList({ subListPublicId });

		expect(result).toEqual({
			success: false,
			error: {
				code: "FORBIDDEN_ERROR",
				message: "このサブリストを削除する権限がありません。",
			},
		});

		const subLists = await db
			.select()
			.from(subListsTable)
			.where(eq(subListsTable.id, subListId));
		expect(subLists).toHaveLength(1);
	});
});
