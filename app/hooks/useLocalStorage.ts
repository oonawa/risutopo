"use client";

import { useCallback, useState } from "react";
import { useSetAtom } from "jotai";
import { appendMovieServiceAtom } from "@/app/store";
import type { MovieInfo } from "@/app/types/MovieInputForm/MovieInfo";

export function useLocalStorage() {
	const appendMovieService = useSetAtom(appendMovieServiceAtom);
	const [storageErrorMessage, setStorageErrorMessage] = useState<string>("");

	const appendMovieToStorage = useCallback(
		(movie: MovieInfo) => {
			appendMovieService(movie);

			setStorageErrorMessage("");
		},
		[appendMovieService],
	);

	return {
		storageErrorMessage,
		appendMovieToStorage,
	};
}
