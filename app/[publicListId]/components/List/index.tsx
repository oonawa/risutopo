import { getSubLists } from "@/features/list/actions/getSubLists";
import { getCheckedSubListIds } from "@/features/list/actions/getCheckedSubListIds";
import { userListIdAndPublicListId } from "@/features/list/repositories/server/listRepository";
import type { ListItem } from "@/features/list/types/ListItem";
import SubListTabBar from "@/app/components/SubListTabBar";
import SubListDeleteButton from "@/app/[publicListId]/components/SubListDeleteButton";
import SubListRenameButton from "@/app/[publicListId]/components/SubListRenameButton";
import ListContainer from "./Container";
import ListItemDetail from "./Item/Detail";
import Item from "./Item";

type Props = {
	items: ListItem[];
	publicListId: string;
	userId: number;
};

export default async function List({ items, publicListId, userId }: Props) {
	const [subListsResult, checkedSubListIdsResult, mainListInfo] =
		await Promise.all([
			getSubLists(),
			getCheckedSubListIds(),
			userListIdAndPublicListId(userId),
		]);

	const subLists = subListsResult.success ? subListsResult.data : [];
	const mainListPublicId = mainListInfo?.publicListId ?? publicListId;

	const checkedSubListIdsMap = new Map<string, string[]>(
		checkedSubListIdsResult.success ? checkedSubListIdsResult.data : [],
	);

	return (
		<>
			<SubListTabBar
				mainListPublicId={mainListPublicId}
				currentPublicId={publicListId}
				subLists={subLists}
				isLoggedIn={true}
			/>
			{mainListPublicId !== publicListId && (
				<div className="w-full flex justify-end gap-2 px-4 sm:px-9 pt-4">
					<SubListRenameButton
						subListPublicId={publicListId}
						subListName={subLists.find((sl) => sl.publicId === publicListId)?.name ?? ""}
						isLoggedIn={true}
					/>
					<SubListDeleteButton
						subListPublicId={publicListId}
						mainListPublicId={mainListPublicId}
						isLoggedIn={true}
					/>
				</div>
			)}
			<ListContainer>
				{items.map((movie) => {
					const checkedSubListIds =
						checkedSubListIdsMap.get(movie.listItemId) ?? [];
					return (
						<Item
							key={movie.listItemId}
							movie={movie}
							isLoggedIn={true}
							publicListId={publicListId}
							subLists={subLists}
							checkedSubListIds={checkedSubListIds}
						/>
					);
				})}
			</ListContainer>
			<ListItemDetail
				publicListId={publicListId}
				isLoggedIn={true}
				subLists={subLists}
				checkedSubListIdsMap={checkedSubListIdsMap}
			/>
		</>
	);
}
