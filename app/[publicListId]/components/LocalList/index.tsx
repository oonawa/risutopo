"use client";

import { useSyncExternalStore } from "react";
import { formatDate } from "@/lib/date";
import { useListLocalStorageRepository } from "@/features/list/repositories/client/useListLocalStorageRepository";
import ListContainer from "../List/Container";
import ListItemDetail from "../List/Item/Detail";
import Item from "../List/Item";

export default function LocalList() {
	const { getListItems } = useListLocalStorageRepository();

	const items = useSyncExternalStore(
		(onStoreChange) => {
			window.addEventListener("storage", onStoreChange);
			return () => window.removeEventListener("storage", onStoreChange);
		},
		() => getListItems(),
		() => null,
	);

	if (!items) {
		return;
	}

	return (
		<>
			<ListContainer>
				{items.map((movie, index) => {
					return (
						<Item
							key={`${formatDate(movie.createdAt)}-${index}`}
							movie={movie}
						/>
					);
				})}
			</ListContainer>
			<ListItemDetail />
		</>
	);
}
