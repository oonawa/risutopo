import { useCallback, useState } from "react";
import type { DraftListItem, ListItem } from "../types/ListItem";
import { useListLocalStorageRepository } from "../repositories/client/useListLocalStorageRepository";

const hasListItemId = (movie: DraftListItem | ListItem): movie is ListItem => {
	return "listItemId" in movie;
};

export const useSearchDuplicateMovie = () => {
	const { getListItems } = useListLocalStorageRepository();

	const [possibleDuplicateMovies, setPossibleDuplicateMovies] = useState<
		ListItem[] | null
	>(null);
	const [sameMovie, setSameMovie] = useState<ListItem | null>(null);

	const searchDuplicateMovie = useCallback(
		(movie: DraftListItem | ListItem) => {
			const existingUserList = getListItems();
			const extractedExternalMovieId = movie.details?.externalDatabaseMovieId;

			const duplicatedMovies = existingUserList.filter((item) => {
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
		[getListItems],
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
