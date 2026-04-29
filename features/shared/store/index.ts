import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import type { ListItem } from "@/features/list/types/ListItem";

export const LOCAL_STORAGE_KEY = "risutopotto";

export type RisutopottoStorage = {
	list: {
		listId: string;
		items: ListItem[];
	};
	subLists: { subListId: string; name: string; listItemIds: string[] }[];
};

export const risutopottoAtom = atomWithStorage<RisutopottoStorage>(
	LOCAL_STORAGE_KEY,
	{ list: { listId: "", items: [] }, subLists: [] },
	undefined,
	{
		getOnInit: true,
	},
);

export const localListAtom = atom(null, (get, set, payload: ListItem) => {
	const current = get(risutopottoAtom);
	const existing = current.list.items;

	const next = [...existing, payload];
	set(risutopottoAtom, {
		...current,
		list: {
			listId: current.list.listId,
			items: next,
		},
	});
});
