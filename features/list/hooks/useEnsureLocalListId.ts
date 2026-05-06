"use client";

import { useCallback } from "react";
import { useListLocalStorageRepository } from "./useListLocalStorageRepository";

export const useEnsureLocalListId = () => {
	const { getListId, initializeEmptyList } = useListLocalStorageRepository();

	const ensureListId = useCallback((): void => {
		const existing = getListId();
		if (!existing) {
			initializeEmptyList();
		}
	}, [getListId, initializeEmptyList]);

	return { ensureListId };
}
