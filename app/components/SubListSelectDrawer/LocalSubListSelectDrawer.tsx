"use client";

import { useListLocalStorageRepository } from "@/features/list/repositories/client/useListLocalStorageRepository";
import SubListSelectDrawerLayout from "./SubListSelectDrawerLayout";
import { useSubListToggle } from "./useSubListToggle";

type SubList = {
	publicId: string;
	name: string;
};

type Props = {
	isOpen: boolean;
	onClose: () => void;
	listItemId: string;
	publicListId: string;
	subLists: SubList[];
	checkedSubListIds: string[];
};

export default function LocalSubListSelectDrawer({
	isOpen,
	onClose,
	listItemId,
	publicListId,
	subLists,
	checkedSubListIds,
}: Props) {
	const { addSubListItem, removeSubListItem } = useListLocalStorageRepository();

	const { checkedIds, isPending, handleToggle } = useSubListToggle({
		initialCheckedIds: checkedSubListIds,
		onAdd: (publicId) => addSubListItem(publicId, listItemId),
		onRemove: (publicId) => removeSubListItem(publicId, listItemId),
	});

	return (
		<SubListSelectDrawerLayout
			isOpen={isOpen}
			onClose={onClose}
			subLists={subLists}
			checkedIds={checkedIds}
			isPending={isPending}
			onToggle={handleToggle}
			onCreateClick={() => {}}
			publicListId={publicListId}
			isLoggedIn={false}
		/>
	);
}
