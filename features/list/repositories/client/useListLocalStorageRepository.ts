"use client";

import { useSetAtom, useStore } from "jotai";
import { appendListItemAtom, risutopottoAtom } from "@/features/shared/store";
import type { ListItem } from "@/features/list/types/ListItem";

export function useListLocalStorageRepository() {
	const appendListItem = useSetAtom(appendListItemAtom);
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
	};
}
