"use client";

import { useCallback, useState } from "react";
import { useSetAtom } from "jotai";
import { appendMovieServiceAtom, risutopottoAtom } from "@/app/store";
import type { MovieInfo } from "@/app/types/MovieInputForm/MovieInfo";
import { getUserMovieList } from "../actions/getUserMovieList";

export function useLocalStorage() {
	const appendMovieService = useSetAtom(appendMovieServiceAtom);
	const setRisutopotto = useSetAtom(risutopottoAtom);
	const [storageErrorMessage, setStorageErrorMessage] = useState<string>("");

	const appendMovieToStorage = useCallback(
		(movie: MovieInfo) => {
			appendMovieService(movie);

			setStorageErrorMessage("");
		},
		[appendMovieService],
	);

	const hydrateLocalStorageFromDb = useCallback(
		async ({ listId }: { listId: number }) => {
			const result = await getUserMovieList(listId);
			if (result.success) {
				setRisutopotto({
					movie_service: result.data,
				});
				setStorageErrorMessage("");
				return;
			}

			setStorageErrorMessage(result.error.message);
		},
		[setRisutopotto],
	);

	return {
		storageErrorMessage,
		appendMovieToStorage,
		hydrateLocalStorageFromDb,
	};
}
