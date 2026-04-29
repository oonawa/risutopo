import { createStore } from "jotai";
import { describe, expect, it } from "vitest";
import { risutopottoAtom } from "@/features/shared/store";

// useListLocalStorageRepository のサブリスト操作は jotai の risutopottoAtom を
// 読み書きする純粋なアトム操作であるため、createStore を用いてロジックを検証する。

function setupStore() {
	const store = createStore();
	store.set(risutopottoAtom, {
		list: { listId: "test-list-id", items: [] },
		subLists: [],
	});
	return store;
}

function getSubLists(
	store: ReturnType<typeof createStore>,
): { subListId: string; name: string; listItemIds: string[] }[] {
	return store.get(risutopottoAtom).subLists;
}

function createSubList(store: ReturnType<typeof createStore>, name: string) {
	const current = store.get(risutopottoAtom);
	const subListId = crypto.randomUUID();
	store.set(risutopottoAtom, {
		...current,
		subLists: [...current.subLists, { subListId, name, listItemIds: [] }],
	});
	return subListId;
}

function addSubListItem(
	store: ReturnType<typeof createStore>,
	subListId: string,
	listItemId: string,
) {
	const current = store.get(risutopottoAtom);
	store.set(risutopottoAtom, {
		...current,
		subLists: current.subLists.map((sl) =>
			sl.subListId === subListId
				? { ...sl, listItemIds: [...sl.listItemIds, listItemId] }
				: sl,
		),
	});
}

function removeSubListItem(
	store: ReturnType<typeof createStore>,
	subListId: string,
	listItemId: string,
) {
	const current = store.get(risutopottoAtom);
	store.set(risutopottoAtom, {
		...current,
		subLists: current.subLists.map((sl) =>
			sl.subListId === subListId
				? {
						...sl,
						listItemIds: sl.listItemIds.filter((id) => id !== listItemId),
					}
				: sl,
		),
	});
}

function clearSubLists(store: ReturnType<typeof createStore>) {
	const current = store.get(risutopottoAtom);
	store.set(risutopottoAtom, { ...current, subLists: [] });
}

function renameSubList(
	store: ReturnType<typeof createStore>,
	subListId: string,
	name: string,
) {
	const current = store.get(risutopottoAtom);
	store.set(risutopottoAtom, {
		...current,
		subLists: current.subLists.map((sl) =>
			sl.subListId === subListId ? { ...sl, name } : sl,
		),
	});
}

describe("useListLocalStorageRepository - サブリスト操作", () => {
	it("getSubLists: 初期状態ではサブリスト一覧が空配列を返す", () => {
		const store = setupStore();
		expect(getSubLists(store)).toEqual([]);
	});

	it("createSubList: 新規サブリストを追加できる", () => {
		const store = setupStore();
		const subListId = createSubList(store, "お気に入り");

		const subLists = getSubLists(store);
		expect(subLists).toHaveLength(1);
		expect(subLists[0]).toMatchObject({
			subListId,
			name: "お気に入り",
			listItemIds: [],
		});
	});

	it("createSubList: 複数のサブリストを追加できる", () => {
		const store = setupStore();
		createSubList(store, "アクション");
		createSubList(store, "ホラー");

		const subLists = getSubLists(store);
		expect(subLists).toHaveLength(2);
		expect(subLists.map((sl) => sl.name)).toEqual(["アクション", "ホラー"]);
	});

	it("addSubListItem: 指定サブリストにアイテムIDを追加できる", () => {
		const store = setupStore();
		const subListId = createSubList(store, "お気に入り");
		const listItemId = crypto.randomUUID();

		addSubListItem(store, subListId, listItemId);

		const subLists = getSubLists(store);
		expect(subLists[0].listItemIds).toEqual([listItemId]);
	});

	it("addSubListItem: 対象外のサブリストには影響しない", () => {
		const store = setupStore();
		const subListId1 = createSubList(store, "リスト1");
		const subListId2 = createSubList(store, "リスト2");
		const listItemId = crypto.randomUUID();

		addSubListItem(store, subListId1, listItemId);

		const subLists = getSubLists(store);
		const list2 = subLists.find((sl) => sl.subListId === subListId2);
		expect(list2?.listItemIds).toEqual([]);
	});

	it("removeSubListItem: 指定サブリストからアイテムIDを削除できる", () => {
		const store = setupStore();
		const subListId = createSubList(store, "お気に入り");
		const listItemId1 = crypto.randomUUID();
		const listItemId2 = crypto.randomUUID();

		addSubListItem(store, subListId, listItemId1);
		addSubListItem(store, subListId, listItemId2);
		removeSubListItem(store, subListId, listItemId1);

		const subLists = getSubLists(store);
		expect(subLists[0].listItemIds).toEqual([listItemId2]);
	});

	it("clearSubLists: サブリストを全て空にする", () => {
		const store = setupStore();
		createSubList(store, "リスト1");
		createSubList(store, "リスト2");

		clearSubLists(store);

		expect(getSubLists(store)).toEqual([]);
	});

	it("clearSubLists: list フィールドは影響を受けない", () => {
		const store = setupStore();
		createSubList(store, "リスト1");

		clearSubLists(store);

		const state = store.get(risutopottoAtom);
		expect(state.list).toEqual({ listId: "test-list-id", items: [] });
	});

	it("renameSubList: 対象サブリストの name が更新される", () => {
		const store = setupStore();
		const subListId = createSubList(store, "変更前の名前");

		renameSubList(store, subListId, "新しい名前");

		const subLists = getSubLists(store);
		expect(subLists[0]?.name).toBe("新しい名前");
	});

	it("renameSubList: 対象外のサブリストの name は変わらない", () => {
		const store = setupStore();
		const subListId1 = createSubList(store, "リスト1");
		createSubList(store, "リスト2");

		renameSubList(store, subListId1, "新しい名前");

		const subLists = getSubLists(store);
		expect(subLists[1]?.name).toBe("リスト2");
	});
});
