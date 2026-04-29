import crypto from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/db/client";
import {
	listItemsTable,
	listsTable,
	subListsTable,
	usersTable,
} from "@/db/schema";
import { createSubList } from "./createSubList";

const { mockCurrentUserId } = vi.hoisted(() => ({
	mockCurrentUserId: vi.fn(),
}));

vi.mock("@/features/shared/actions/currentUserId", () => ({
	currentUserId: mockCurrentUserId,
}));

describe("createSubList", () => {
	let userId = 0;
	let publicListId = "";

	beforeEach(async () => {
		await db.delete(listItemsTable);
		await db.delete(listsTable);
		await db.delete(usersTable);

		const [user] = await db
			.insert(usersTable)
			.values({ publicId: "create-sub-list-user" })
			.returning({ id: usersTable.id });

		userId = user.id;
		publicListId = crypto.randomUUID();

		await db.insert(listsTable).values({ publicId: publicListId, userId });
	});

	it("認証済みユーザーはサブリストを作成できる", async () => {
		mockCurrentUserId.mockResolvedValue({
			success: true,
			data: { userId },
		});

		const result = await createSubList({
			publicListId,
			name: "お気に入り",
		});

		expect(result.success).toBe(true);
		if (!result.success) return;
		expect(result.data.subListPublicId).toMatch(
			/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
		);

		const sublists = await db.select().from(subListsTable);
		expect(sublists).toHaveLength(1);
		expect(sublists[0]?.name).toBe("お気に入り");
	});

	it("未認証ユーザーは UNAUTHORIZED_ERROR を受け取る", async () => {
		mockCurrentUserId.mockResolvedValue({ success: false });

		const result = await createSubList({
			publicListId,
			name: "お気に入り",
		});

		expect(result).toEqual({
			success: false,
			error: {
				code: "UNAUTHORIZED_ERROR",
				message: "ログインかユーザー登録をしてください。",
			},
		});
	});

	it("不正な publicListId では VALIDATION_ERROR を返す", async () => {
		mockCurrentUserId.mockResolvedValue({
			success: true,
			data: { userId },
		});

		const result = await createSubList({
			publicListId: "not-a-uuid",
			name: "お気に入り",
		});

		expect(result).toEqual({
			success: false,
			error: {
				code: "VALIDATION_ERROR",
				message: "不正なリクエストです。",
			},
		});
	});

	it("空の name では VALIDATION_ERROR を返す", async () => {
		mockCurrentUserId.mockResolvedValue({
			success: true,
			data: { userId },
		});

		const result = await createSubList({
			publicListId,
			name: "",
		});

		expect(result).toEqual({
			success: false,
			error: {
				code: "VALIDATION_ERROR",
				message: "不正なリクエストです。",
			},
		});
	});

	it("他ユーザーのリストに対しては NOT_FOUND_ERROR を返す", async () => {
		mockCurrentUserId.mockResolvedValue({
			success: true,
			data: { userId },
		});

		const result = await createSubList({
			publicListId: crypto.randomUUID(),
			name: "お気に入り",
		});

		expect(result).toEqual({
			success: false,
			error: {
				code: "NOT_FOUND_ERROR",
				message: "リストが見つかりませんでした。",
			},
		});
	});
});
