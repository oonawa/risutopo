import crypto from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/db/client";
import {
	listItemsTable,
	listsTable,
	subListsTable,
	usersTable,
} from "@/db/schema";
import { getSubLists } from "./getSubLists";

const { mockCurrentUserId } = vi.hoisted(() => ({
	mockCurrentUserId: vi.fn(),
}));

vi.mock("@/features/shared/actions/currentUserId", () => ({
	currentUserId: mockCurrentUserId,
}));

describe("getSubLists", () => {
	let userId = 0;
	let listId = 0;

	beforeEach(async () => {
		await db.delete(listItemsTable);
		await db.delete(listsTable);
		await db.delete(usersTable);

		const [user] = await db
			.insert(usersTable)
			.values({ publicId: "get-sub-lists-user" })
			.returning({ id: usersTable.id });

		userId = user.id;

		const [list] = await db
			.insert(listsTable)
			.values({ publicId: crypto.randomUUID(), userId })
			.returning({ id: listsTable.id });

		listId = list.id;
	});

	it("認証済みユーザーのサブリスト一覧を返す", async () => {
		mockCurrentUserId.mockResolvedValue({
			success: true,
			data: { userId },
		});

		const subListPublicId1 = crypto.randomUUID();
		const subListPublicId2 = crypto.randomUUID();

		await db.insert(subListsTable).values([
			{
				publicId: subListPublicId1,
				listId,
				name: "アクション",
				createdAt: new Date(),
			},
			{
				publicId: subListPublicId2,
				listId,
				name: "コメディ",
				createdAt: new Date(),
			},
		]);

		const result = await getSubLists();

		expect(result.success).toBe(true);
		if (!result.success) return;
		expect(result.data).toHaveLength(2);
		expect(result.data.map((s) => s.name)).toContain("アクション");
		expect(result.data.map((s) => s.name)).toContain("コメディ");
	});

	it("サブリストがない場合は空配列を返す", async () => {
		mockCurrentUserId.mockResolvedValue({
			success: true,
			data: { userId },
		});

		const result = await getSubLists();

		expect(result).toEqual({ success: true, data: [] });
	});

	it("未認証ユーザーは UNAUTHORIZED_ERROR を受け取る", async () => {
		mockCurrentUserId.mockResolvedValue({ success: false });

		const result = await getSubLists();

		expect(result).toEqual({
			success: false,
			error: {
				code: "UNAUTHORIZED_ERROR",
				message: "ログインかユーザー登録をしてください。",
			},
		});
	});
});
