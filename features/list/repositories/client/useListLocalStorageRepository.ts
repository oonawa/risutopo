"use client";

import { useSetAtom, useStore } from "jotai";
import { localListAtom, risutopottoAtom } from "@/features/shared/store";
import type { ListItem } from "@/features/list/types/ListItem";
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
			list: {
				listId: listId ?? current.list.listId,
				items: listItems,
			},
		});
	};

	const storeListItem = (newItem: ListItem) => {
		const { items, listId } = store.get(risutopottoAtom).list;

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
			list: {
				listId,
				items: nextItems,
			},
		});

		return newItem;
	};

	const removeListItem = (listItemId: string) => {
		const { items, listId } = store.get(risutopottoAtom).list;
		const removed = items.filter((item) => item.listItemId !== listItemId);

		setRisutopotto({
			list: {
				listId,
				items: removed,
			},
		});
	};

	const initializeEmptyList = () => {
		setRisutopotto({
			list: {
				listId: crypto.randomUUID(),
				items: [],
			},
		});
	};

	const clearLocalList = () => {
		const listId = getListId();

		setRisutopotto({
			list: {
				listId,
				items: [],
			},
		});
	};

	const parseLocalList = () => {
		const parsedLocalList = localListSchema.safeParse(
			store.get(risutopottoAtom).list,
		);

		return parsedLocalList.success
			? parsedLocalList.data
			: {
					listId: "",
					items: [],
				};
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
	};
}
