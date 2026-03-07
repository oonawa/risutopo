"use client";

import { useCallback, useState } from "react";
import type { ListItem } from "@/features/list/types/ListItem";
import { getUserMovieList } from "../actions/getUserMovieList";
import { useListLocalStorageRepository } from "../repositories/client/useListLocalStorageRepository";

export function useLocalStorage() {
	const {
		appendListItem,
		replaceListItems,
		getListItems,
		initializeEmptyList,
	} = useListLocalStorageRepository();
	const [storageErrorMessage, setStorageErrorMessage] = useState<string>("");

	const appendMovieToStorage = useCallback(
		(movie: ListItem) => {
			appendListItem(movie);

			setStorageErrorMessage("");
		},
		[appendListItem],
	);

	const fetchAndCacheListItems = useCallback(
		async ({ listPublicId }: { listPublicId: string }): Promise<ListItem[]> => {
			const result = await getUserMovieList(listPublicId);
			if (result.success) {
				replaceListItems(result.data, listPublicId);
				setStorageErrorMessage("");
				return result.data;
			}

			setStorageErrorMessage(result.error.message);
			return getListItems();
		},
		[getListItems, replaceListItems],
	);

	const ensureLocalList = useCallback(
		async ({ listPublicId }: { listPublicId: string | null }) => {
			const cachedListItems = getListItems();

			if (!listPublicId || !navigator.onLine) {
				if (!cachedListItems.length) {
					initializeEmptyList();
				}
				return cachedListItems;
			}

			return fetchAndCacheListItems({ listPublicId });
		},
		[getListItems, fetchAndCacheListItems, initializeEmptyList],
	);

	return {
		storageErrorMessage,
		appendMovieToStorage,
		ensureLocalList,
		getListItems,
	};
}
