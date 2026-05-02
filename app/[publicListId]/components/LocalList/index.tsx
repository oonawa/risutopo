"use client";

import { useMemo } from "react";
import { useAtomValue } from "jotai";
import { useSearchParams } from "next/navigation";
import { risutopottoAtom } from "@/features/shared/store";
import {
	sortItems,
	type SortKey,
	type SortOrder,
} from "@/features/list/helpers/sortListItems";
import SubListTabBar from "@/app/components/SubListTabBar";
import SubListMoreMenu from "@/app/[publicListId]/components/SubListMoreMenu";
import SortButton from "@/app/[publicListId]/components/SortButton";
import ListContainer from "../List/Container";
import ListItemDetail from "../List/Item/Detail";
import Item from "../List/Item";

type Props = {
	publicListId: string;
	sort?: string;
};

const parseSortParam = (
	sort: string | null | undefined,
): { sortKey: SortKey; sortOrder: SortOrder } => {
	if (!sort) return { sortKey: "createdAt", sortOrder: "desc" };
	const parts = sort.split("_");
	const order = parts[parts.length - 1];
	const key = parts.slice(0, -1).join("_");
	const validKeys: SortKey[] = ["createdAt", "releaseDate", "runningMinutes"];
	const validOrders: SortOrder[] = ["asc", "desc"];
	const sortKey = validKeys.includes(key as SortKey) ? (key as SortKey) : "createdAt";
	const sortOrder = validOrders.includes(order as SortOrder) ? (order as SortOrder) : "desc";
	return { sortKey, sortOrder };
};

export default function LocalList({ publicListId }: Props) {
	const store = useAtomValue(risutopottoAtom);
	const searchParams = useSearchParams();
	const sortParam = searchParams.get("sort");

	const listId = store.list.listId;
	const allItems = store.list.items;
	const rawSubLists = store.subLists;

	const { sortKey, sortOrder } = parseSortParam(sortParam);

	const items = useMemo(() => {
		const filtered = (() => {
			if (publicListId === listId) {
				return allItems;
			}
			const subList = rawSubLists.find((sl) => sl.subListId === publicListId);
			if (!subList) {
				return allItems;
			}
			return allItems.filter((item) =>
				subList.listItemIds.includes(item.listItemId),
			);
		})();
		return sortItems(filtered, sortKey, sortOrder);
	}, [publicListId, listId, allItems, rawSubLists, sortKey, sortOrder]);

	const subLists = useMemo(
		() =>
			rawSubLists.map(({ subListId, name }) => ({
				publicId: subListId,
				name,
			})),
		[rawSubLists],
	);

	if (!listId) {
		return;
	}

	return (
		<>
			<SubListTabBar
				mainListPublicId={listId}
				currentPublicId={publicListId}
				subLists={subLists}
				isLoggedIn={false}
			/>
			<div className="w-full flex justify-end items-center gap-1 px-4 sm:px-9 pt-4">
				<SortButton />
				{listId !== publicListId && (
					<SubListMoreMenu
						subListPublicId={publicListId}
						subListName={rawSubLists.find((sl) => sl.subListId === publicListId)?.name ?? ""}
						mainListPublicId={listId}
						isLoggedIn={false}
					/>
				)}
			</div>
			<ListContainer>
				{items.map((movie) => {
					return (
						<Item
							key={movie.listItemId}
							movie={movie}
							isLoggedIn={false}
							publicListId={publicListId}
							sortKey={sortKey}
						/>
					);
				})}
			</ListContainer>
			<ListItemDetail publicListId={publicListId} isLoggedIn={false} />
		</>
	);
}
