"use client";

import { useListLocalStorageRepository } from "@/features/list/repositories/client/useListLocalStorageRepository";
import ListItemDetail from "../List/Item/Detail";
import ListItem from "../List/Item";

type Props = {
	publicListId: string;
};

export default function LocalList({ publicListId }: Props) {
	const { getListItems } = useListLocalStorageRepository();

	return (
		<>
			<div className="flex flex-wrap justify-start pl-0 sm:pl-5">
				{getListItems().map((movie) => {
					return <ListItem key={movie.listItemId} movie={movie} />;
				})}
			</div>

			<ListItemDetail publicListId={publicListId} />
		</>
	);
}
