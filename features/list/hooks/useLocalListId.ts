"use client";

import { useCallback } from "react";
import { useListLocalStorageRepository } from "../repositories/client/useListLocalStorageRepository";

export function useLocalListId() {
	const { getListId, initializeEmptyList } = useListLocalStorageRepository();

	const getOrCreateListId = useCallback((): string => {
		const existing = getListId();
		if (existing) {
			return existing;
		}

		initializeEmptyList();
		return getListId();
	}, [getListId, initializeEmptyList]);

	return { getOrCreateListId };
}
