import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { storeMovie } from "@/app/actions/storeMovie";
import type { MovieInfo } from "@/app/types/MovieInputForm/MovieInfo";

type Props = {
	listId: number | null;
};

export function useMovieForm({ listId }: Props) {
	const { storageErrorMessage, appendMovieToStorage } = useLocalStorage();

	const registerMovie = useCallback(
		async (movie: MovieInfo) => {
			appendMovieToStorage(movie);

			if (!listId) {
				return {
					success: true,
					data: movie,
				};
			}

			return await storeMovie({
				listId,
				movie,
			});
		},
		[listId, appendMovieToStorage],
	);

	return { storageErrorMessage, registerMovie };
}
