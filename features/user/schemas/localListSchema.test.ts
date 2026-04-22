import { describe, expect, it } from "vitest";
import { localListSchema, localSubListSchema } from "./localListSchema";

describe("localSubListSchema", () => {
	it("正常なサブリストデータをパースできる", () => {
		const subListId = crypto.randomUUID();
		const listItemId1 = crypto.randomUUID();
		const listItemId2 = crypto.randomUUID();

		const result = localSubListSchema.safeParse({
			subListId,
			name: "お気に入り",
			listItemIds: [listItemId1, listItemId2],
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toEqual({
				subListId,
				name: "お気に入り",
				listItemIds: [listItemId1, listItemId2],
			});
		}
	});

	it("subListId が UUID でなければバリデーション失敗する", () => {
		const result = localSubListSchema.safeParse({
			subListId: "not-a-uuid",
			name: "お気に入り",
			listItemIds: [],
		});

		expect(result.success).toBe(false);
	});

	it("listItemIds の要素が UUID でなければバリデーション失敗する", () => {
		const result = localSubListSchema.safeParse({
			subListId: crypto.randomUUID(),
			name: "お気に入り",
			listItemIds: ["not-a-uuid"],
		});

		expect(result.success).toBe(false);
	});
});

describe("localListSchema（subLists フィールド追加後）", () => {
	it("subLists フィールドを含むリストデータをパースできる", () => {
		const listId = crypto.randomUUID();
		const subListId = crypto.randomUUID();
		const listItemId = crypto.randomUUID();

		const result = localListSchema.safeParse({
			listId,
			items: [],
			subLists: [
				{
					subListId,
					name: "マイリスト",
					listItemIds: [listItemId],
				},
			],
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.subLists).toHaveLength(1);
			expect(result.data.subLists[0]).toEqual({
				subListId,
				name: "マイリスト",
				listItemIds: [listItemId],
			});
		}
	});

	it("subLists が空配列でもパースできる", () => {
		const listId = crypto.randomUUID();

		const result = localListSchema.safeParse({
			listId,
			items: [],
			subLists: [],
		});

		expect(result.success).toBe(true);
	});
});
