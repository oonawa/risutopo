"use client";

import { useSetAtom, useStore } from "jotai";

import type { ListItem } from "@/features/list/types/ListItem";
import { localListAtom, risutopottoAtom } from "@/features/shared/store";
import { localListSchema } from "@/features/user/schemas/localListSchema";

export function useListLocalStorageRepository() {
	const appendListItem = useSetAtom(localListAtom);
	const setRisutopotto = useSetAtom(risutopottoAtom);
	const store = useStore();

	const getListItems = (): ListItem[] => {
		return store.get(risutopottoAtom).list.items;
	};

	const getListId = (): string => {
		return store.get(risutopottoAtom).list.listId;
	};

	const replaceListItems = (listItems: ListItem[], listId?: string) => {
		const current = store.get(risutopottoAtom);
		setRisutopotto({
			...current,
			list: {
				listId: listId ?? current.list.listId,
				items: listItems,
			},
		});
	};

	const storeListItem = (newItem: ListItem) => {
		const current = store.get(risutopottoAtom);
		const { items, listId } = current.list;

		const existingItemIndex = items.findIndex(
			(item) => item.listItemId === newItem.listItemId,
		);
		const nextItems =
			existingItemIndex === -1
				? [newItem, ...items]
				: items.map((item, index) =>
						index === existingItemIndex ? newItem : item,
					);

		setRisutopotto({
			...current,
			list: {
				listId,
				items: nextItems,
			},
		});

		return newItem;
	};

	const removeListItem = (listItemId: string) => {
		const current = store.get(risutopottoAtom);
		const { items, listId } = current.list;
		const removed = items.filter((item) => item.listItemId !== listItemId);

		setRisutopotto({
			...current,
			list: {
				listId,
				items: removed,
			},
		});
	};

	const initializeEmptyList = () => {
		const current = store.get(risutopottoAtom);
		setRisutopotto({
			...current,
			list: {
				listId: crypto.randomUUID(),
				items: [],
			},
		});
	};

	const clearLocalList = () => {
		const current = store.get(risutopottoAtom);
		setRisutopotto({
			...current,
			list: {
				listId: current.list.listId,
				items: [],
			},
		});
	};

	const parseLocalList = () => {
		const current = store.get(risutopottoAtom);
		const parsedLocalList = localListSchema.safeParse({
			...current.list,
			subLists: current.subLists,
		});

		return parsedLocalList.success
			? parsedLocalList.data
			: {
					listId: "",
					items: [],
					subLists: [],
				};
	};

	const getSubLists = (): {
		subListId: string;
		name: string;
		listItemIds: string[];
	}[] => {
		return store.get(risutopottoAtom).subLists;
	};

	const createSubList = (name: string): string => {
		const current = store.get(risutopottoAtom);
		const subListId = crypto.randomUUID();
		setRisutopotto({
			...current,
			subLists: [...current.subLists, { subListId, name, listItemIds: [] }],
		});
		return subListId;
	};

	const addSubListItem = (subListId: string, listItemId: string) => {
		const current = store.get(risutopottoAtom);
		setRisutopotto({
			...current,
			subLists: current.subLists.map((sl) =>
				sl.subListId === subListId
					? { ...sl, listItemIds: [...sl.listItemIds, listItemId] }
					: sl,
			),
		});
	};

	const removeSubListItem = (subListId: string, listItemId: string) => {
		const current = store.get(risutopottoAtom);
		setRisutopotto({
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
	};

	const renameSubList = (subListId: string, name: string) => {
		const current = store.get(risutopottoAtom);
		setRisutopotto({
			...current,
			subLists: current.subLists.map((sl) =>
				sl.subListId === subListId ? { ...sl, name } : sl,
			),
		});
	};

	const deleteSubList = (subListId: string) => {
		const current = store.get(risutopottoAtom);
		setRisutopotto({
			...current,
			subLists: current.subLists.filter((sl) => sl.subListId !== subListId),
		});
	};

	const clearSubLists = () => {
		const current = store.get(risutopottoAtom);
		setRisutopotto({ ...current, subLists: [] });
	};

	return {
		getListItems,
		getListId,
		appendListItem,
		replaceListItems,
		initializeEmptyList,
		removeListItem,
		storeListItem,
		parseLocalList,
		clearLocalList,
		getSubLists,
		createSubList,
		addSubListItem,
		removeSubListItem,
		renameSubList,
		deleteSubList,
		clearSubLists,
	};
}
