import { useCallback, useState } from "react";
import type { DraftListItem, ListItem } from "../types/ListItem";

const hasListItemId = (movie: DraftListItem | ListItem): movie is ListItem => {
	return "listItemId" in movie;
};

export const useSearchDuplicateMovie = () => {

	const [possibleDuplicateMovies, setPossibleDuplicateMovies] = useState<
		ListItem[] | null
	>(null);
	const [sameMovie, setSameMovie] = useState<ListItem | null>(null);

	const searchDuplicateMovie = useCallback(
		(movie: DraftListItem | ListItem, existingList: ListItem[]) => {
			const extractedExternalMovieId = movie.details?.externalDatabaseMovieId;

			const duplicatedMovies = existingList.filter((item) => {
				if (hasListItemId(movie) && movie.listItemId === item.listItemId) {
					return false;
				}

				const hasSameWatchUrl = item.url === movie.url;
				const hasSameTitle = item.title === movie.title;
				const hasSameExternalMovieId =
					extractedExternalMovieId !== undefined &&
					item.details?.externalDatabaseMovieId === extractedExternalMovieId;

				return hasSameWatchUrl || hasSameTitle || hasSameExternalMovieId;
			});

			setPossibleDuplicateMovies(
				duplicatedMovies.length > 0 ? duplicatedMovies : null,
			);
			setSameMovie(
				duplicatedMovies.find((cachedMovie) => cachedMovie.url === movie.url) ??
					null,
			);
		},
		[],
	);

	const clearDuplicateItem = () => {
		setPossibleDuplicateMovies(null);
		setSameMovie(null);
	};

	return {
		searchDuplicateMovie,
		clearDuplicateItem,
		possibleDuplicateMovies,
		sameMovie,
	};
};
