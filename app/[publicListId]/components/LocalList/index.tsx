"use client";

import { useState } from "react";
import { formatDate } from "@/lib/date";
import { useListLocalStorageRepository } from "@/features/list/repositories/client/useListLocalStorageRepository";
import ListContainer from "../List/Container";
import ListItemDetail from "../List/Item/Detail";
import Item from "../List/Item";

type Props = {
	publicListId: string;
};

export default function LocalList({ publicListId }: Props) {
	const { getListItems } = useListLocalStorageRepository();
	const [items] = useState(() => getListItems());

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
