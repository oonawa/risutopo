import { createStore } from "jotai";
import { describe, expect, it } from "vitest";
import { risutopottoAtom } from "./index";

describe("risutopottoAtom のデフォルト値", () => {
	it("subLists フィールドが空配列として初期化される", () => {
		const store = createStore();
		const value = store.get(risutopottoAtom);

		expect(value.subLists).toEqual([]);
	});

	it("list フィールドが初期値を持つ", () => {
		const store = createStore();
		const value = store.get(risutopottoAtom);

		expect(value.list).toEqual({ listId: "", items: [] });
	});
});
