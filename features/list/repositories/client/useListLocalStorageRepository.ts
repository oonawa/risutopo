"use client";

import { useSetAtom, useStore } from "jotai";
import {
	appendMovieServiceAtom,
	risutopottoAtom,
} from "@/features/shared/store";
import type { ListItem } from "@/features/list/types/ListItem";

export function useListLocalStorageRepository() {
	const appendMovieService = useSetAtom(appendMovieServiceAtom);
	const setRisutopotto = useSetAtom(risutopottoAtom);
	const store = useStore();

	const getMovieService = (): ListItem[] => {
		return store.get(risutopottoAtom).movie_service;
	};

	const appendMovie = (movie: ListItem) => {
		appendMovieService(movie);
	};

	const replaceMovieService = (movieService: ListItem[]) => {
		setRisutopotto({ movie_service: movieService });
	};

	return {
		getMovieService,
		appendMovie,
		replaceMovieService,
	};
}
