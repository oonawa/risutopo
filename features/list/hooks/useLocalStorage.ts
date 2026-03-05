"use client";

import { useCallback, useState } from "react";
import type { ListItem } from "@/features/list/types/ListItem";
import { getUserMovieList } from "../actions/getUserMovieList";
import { useListLocalStorageRepository } from "../repositories/client/useListLocalStorageRepository";

export function useLocalStorage() {
	const { appendMovie, replaceMovieService, getMovieService } =
		useListLocalStorageRepository();
	const [storageErrorMessage, setStorageErrorMessage] = useState<string>("");

	const appendMovieToStorage = useCallback(
		(movie: ListItem) => {
			appendMovie(movie);

			setStorageErrorMessage("");
		},
		[appendMovie],
	);

	const hydrateLocalStorageFromDb = useCallback(
		async ({ listPublicId }: { listPublicId: string }) => {
			const result = await getUserMovieList(listPublicId);
			if (result.success) {
				replaceMovieService(result.data);
				setStorageErrorMessage("");
				return;
			}

			setStorageErrorMessage(result.error.message);
		},
		[replaceMovieService],
	);

	return {
		storageErrorMessage,
		appendMovieToStorage,
		hydrateLocalStorageFromDb,
		getMovieService,
	};
}
