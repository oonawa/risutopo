import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import type { SupportedServiceName } from "@/app/consts";

export const LOCAL_STORAGE_KEY = "risutopotto";

export type MovieService = {
	title: string;
	url: string;
	service_name: SupportedServiceName;
};

export type RisutopottoStorage = {
	movie_service: MovieService[];
};

export const risutopottoAtom = atomWithStorage<RisutopottoStorage>(
	LOCAL_STORAGE_KEY,
	{ movie_service: [] },
);

export const appendMovieServiceAtom = atom(
	null,
	(
		get,
		set,
		payload: {
			title: string;
			url: string;
			serviceName: SupportedServiceName;
		},
	) => {
		const current = get(risutopottoAtom);
		const existing = Array.isArray(current.movie_service)
			? current.movie_service
			: [];
		const next = [
			...existing,
			{
				title: payload.title,
				url: payload.url,
				service_name: payload.serviceName,
			},
		];
		set(risutopottoAtom, { movie_service: next });
	},
);
