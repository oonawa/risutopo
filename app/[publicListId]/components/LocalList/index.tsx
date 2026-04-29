"use client";

import { useMemo } from "react";
import { useAtomValue } from "jotai";
import { risutopottoAtom } from "@/features/shared/store";
import SubListTabBar from "@/app/components/SubListTabBar";
import SubListDeleteButton from "@/app/[publicListId]/components/SubListDeleteButton";
import SubListRenameButton from "@/app/[publicListId]/components/SubListRenameButton";
import ListContainer from "../List/Container";
import ListItemDetail from "../List/Item/Detail";
import Item from "../List/Item";

type Props = {
	publicListId: string;
};

export default function LocalList({ publicListId }: Props) {
	const store = useAtomValue(risutopottoAtom);

	const listId = store.list.listId;
	const allItems = store.list.items;
	const rawSubLists = store.subLists;

	const items = useMemo(() => {
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
	}, [publicListId, listId, allItems, rawSubLists]);

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
			{listId !== publicListId && (
				<div className="w-full flex justify-end gap-2 px-4">
					<SubListRenameButton
						subListPublicId={publicListId}
						subListName={rawSubLists.find((sl) => sl.subListId === publicListId)?.name ?? ""}
						isLoggedIn={false}
					/>
					<SubListDeleteButton
						subListPublicId={publicListId}
						mainListPublicId={listId}
						isLoggedIn={false}
					/>
				</div>
			)}
			<ListContainer>
				{items.map((movie) => {
					return (
						<Item
							key={movie.listItemId}
							movie={movie}
							isLoggedIn={false}
							publicListId={publicListId}
						/>
					);
				})}
			</ListContainer>
			<ListItemDetail publicListId={publicListId} isLoggedIn={false} />
		</>
	);
}
