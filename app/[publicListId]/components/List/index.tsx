import { getSubLists } from "@/features/list/actions/getSubLists";
import { getCheckedSubListIds } from "@/features/list/actions/getCheckedSubListIds";
import { userListIdAndPublicListId } from "@/features/list/repositories/server/listRepository";
import type { ListItem } from "@/features/list/types/ListItem";
import {
	sortItems,
	type SortKey,
	type SortOrder,
} from "@/features/list/helpers/sortListItems";
import SubListTabBar from "@/app/components/SubListTabBar";
import SubListMoreMenu from "@/app/[publicListId]/components/SubListMoreMenu";
import SortButton from "@/app/[publicListId]/components/SortButton";
import ListContainer from "./Container";
import ListItemDetail from "./Item/Detail";
import Item from "./Item";

type Props = {
	items: ListItem[];
	publicListId: string;
	userId: number;
	sort?: string;
};

const parseSortParam = (
	sort: string | undefined,
): { sortKey: SortKey; sortOrder: SortOrder } => {
	if (!sort) return { sortKey: "createdAt", sortOrder: "desc" };
	const parts = sort.split("_");
	const order = parts[parts.length - 1];
	const key = parts.slice(0, -1).join("_");
	const validKeys: SortKey[] = ["createdAt", "releaseDate", "runningMinutes"];
	const validOrders: SortOrder[] = ["asc", "desc"];
	const sortKey = validKeys.includes(key as SortKey)
		? (key as SortKey)
		: "createdAt";
	const sortOrder = validOrders.includes(order as SortOrder)
		? (order as SortOrder)
		: "desc";
	return { sortKey, sortOrder };
};

export default async function List({
	items,
	publicListId,
	userId,
	sort,
}: Props) {
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

	const { sortKey, sortOrder } = parseSortParam(sort);
	const sortedItems = sortItems(items, sortKey, sortOrder);

	return (
		<>
			<SubListTabBar
				mainListPublicId={mainListPublicId}
				currentPublicId={publicListId}
				subLists={subLists}
				isLoggedIn={true}
			/>
			<div className="w-full flex justify-end items-center gap-1 px-4 sm:px-9 pt-4">
				<SortButton />
				{mainListPublicId !== publicListId && (
					<SubListMoreMenu
						subListPublicId={publicListId}
						subListName={
							subLists.find((sl) => sl.publicId === publicListId)?.name ?? ""
						}
						mainListPublicId={mainListPublicId}
						isLoggedIn={true}
					/>
				)}
			</div>
			<ListContainer>
				{sortedItems.map((movie) => {
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
							sortKey={sortKey}
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
