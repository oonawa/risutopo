import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import type { ListItem } from "@/features/list/types/ListItem";

export const LOCAL_STORAGE_KEY = "risutopotto";

export type RisutopottoStorage = {
	list: {
		listId: string;
		items: ListItem[];
	};
};

export const risutopottoAtom = atomWithStorage<RisutopottoStorage>(
	LOCAL_STORAGE_KEY,
	{ list: { listId: "", items: [] } },
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
		list: {
			listId: current.list.listId,
			items: next,
		},
	});
});
