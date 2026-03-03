import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import type { ListItem } from "@/features/list/types/ListItem";

export const LOCAL_STORAGE_KEY = "risutopotto";

export type RisutopottoStorage = {
	movie_service: ListItem[];
};

export const risutopottoAtom = atomWithStorage<RisutopottoStorage>(
	LOCAL_STORAGE_KEY,
	{ movie_service: [] },
	undefined,
	{
		getOnInit: true,
	},
);

export const appendMovieServiceAtom = atom(
	null,
	(get, set, payload: ListItem) => {
		const current = get(risutopottoAtom);
		const existing = Array.isArray(current.movie_service)
			? current.movie_service
			: [];

		const next = [
			...existing,
			{
				title: payload.title,
				url: payload.url,
				createdAt: payload.createdAt,
				serviceName: payload.serviceName,
				serviceSlug: payload.serviceSlug,
			},
		];
		set(risutopottoAtom, { movie_service: next });
	},
);
