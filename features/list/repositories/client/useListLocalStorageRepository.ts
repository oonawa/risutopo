"use client";

import { useSetAtom, useStore } from "jotai";
import { localListAtom, risutopottoAtom } from "@/features/shared/store";
import type { ListItem } from "@/features/list/types/ListItem";

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
        const filtered = items.filter((item) => item.listItemId !== newItem.listItemId)

		setRisutopotto({
			list: {
				listId,
				items: [newItem, ...filtered],
			},
		});
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

	return {
		getListItems,
		getListId,
		appendListItem,
		replaceListItems,
		initializeEmptyList,
		removeListItem,
        storeListItem
	};
}
