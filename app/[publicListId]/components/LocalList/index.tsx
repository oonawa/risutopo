"use client";

import { useEffect, useState } from "react";
import type { ListItem } from "@/features/list/types/ListItem";
import { useListLocalStorageRepository } from "@/features/list/repositories/client/useListLocalStorageRepository";
import ListContainer from "../List/Container";
import ListItemDetail from "../List/Item/Detail";
import Item from "../List/Item";
import { formatDate } from "@/lib/date";

type Props = {
	publicListId: string;
};

export default function LocalList({ publicListId }: Props) {
	const [items, setItems] = useState<ListItem[] | undefined>(undefined);
	const { getListItems } = useListLocalStorageRepository();

	useEffect(() => {
		setItems(getListItems());
	}, [getListItems]);

	if (!items) {
		return <div></div>;
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
			<ListItemDetail publicListId={publicListId} />
		</>
	);
}
