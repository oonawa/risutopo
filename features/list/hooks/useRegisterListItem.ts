import { useState, useTransition, useCallback } from "react";
import type { DraftListItem, ListItem } from "../types/ListItem";
import { useSearchDuplicateMovie } from "./useSearchDuplicateMovie";
import { useListLocalStorageRepository } from "./useListLocalStorageRepository";

type Props = {
	items?: ListItem[];
};

export const useRegisterListItem = ({ items }: Props) => {
	const [extractedMovie, setExtractedMovie] = useState<DraftListItem | null>(
		null,
	);

	const {
		sameMovie,
		possibleDuplicateMovies,
		searchDuplicateMovie,
		clearDuplicateItem,
	} = useSearchDuplicateMovie();

	const { getListItems } = useListLocalStorageRepository();

	const [searchExistingMoviePending, searchExistingMovieTransition] =
		useTransition();

	const handleExtract = (extracted: DraftListItem | null) => {
		searchExistingMovieTransition(async () => {
			if (!extracted) {
				return;
			}

			setExtractedMovie(extracted);

			return items
				? searchDuplicateMovie(extracted, items)
				: searchDuplicateMovie(extracted, getListItems());
		});
	};

	const handleCloseResult = useCallback(() => {
		setExtractedMovie(null);
	}, []);

	const handleRegisterContinue = useCallback(() => {
		clearDuplicateItem();
	}, [clearDuplicateItem]);

	return {
		extractedMovie,
        setExtractedMovie,
		sameMovie,
		possibleDuplicateMovies,
		searchExistingMoviePending,
		handleExtract,
		handleCloseResult,
		handleRegisterContinue,
	};
};
