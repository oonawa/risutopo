"use client";

import { useMemo, useState } from "react";
import { useAtomValue } from "jotai";
import { formatRelativeDate } from "@/lib/date";
import type { ListItem } from "@/features/list/types/ListItem";
import CheckMarkIcon from "@/components/ui/Icons/CheckMarkIcon";
import SubListSelectDrawer from "@/app/components/SubListSelectDrawer/SubListSelectDrawer";
import LocalSubListSelectDrawer from "@/app/components/SubListSelectDrawer/LocalSubListSelectDrawer";
import SearchButton from "./SearchButton";
import MoreIcon from "@/components/ui/Icons/MoreIcon";
import { Button } from "@/components/ui/button";
import { risutopottoAtom } from "@/features/shared/store";

type SubList = {
	publicId: string;
	name: string;
};

type LoggedInProps = {
	movie: ListItem;
	isLoggedIn: true;
	publicListId: string;
	subLists: SubList[];
	checkedSubListIds: string[];
};

type GuestProps = {
	movie: ListItem;
	isLoggedIn: false;
	publicListId: string;
};

type Props = LoggedInProps | GuestProps;

export default function Item(props: Props) {
	const { movie, isLoggedIn, publicListId } = props;
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);

	const store = useAtomValue(risutopottoAtom);

	const localSubLists = useMemo(
		() =>
			store.subLists.map(({ subListId, name }) => ({
				publicId: subListId,
				name,
			})),
		[store.subLists],
	);

	const localCheckedSubListIds = useMemo(
		() =>
			store.subLists
				.filter((sl) => sl.listItemIds.includes(movie.listItemId))
				.map((sl) => sl.subListId),
		[store.subLists, movie.listItemId],
	);

	return (
		<div className="relative mx-2 py-2 h-full w-full sm:w-[calc(calc(100%-16px*2)/2-16px)] md:w-[calc(calc(100%-16px*2)/3-16px)] flex flex-col first">
			{isLoggedIn ? (
				<SubListSelectDrawer
					isOpen={isDrawerOpen}
					onClose={() => setIsDrawerOpen(false)}
					listItemId={movie.listItemId}
					publicListId={publicListId}
					subLists={props.subLists}
					checkedSubListIds={props.checkedSubListIds}
				/>
			) : (
				<LocalSubListSelectDrawer
					isOpen={isDrawerOpen}
					onClose={() => setIsDrawerOpen(false)}
					listItemId={movie.listItemId}
					publicListId={publicListId}
					subLists={localSubLists}
					checkedSubListIds={localCheckedSubListIds}
				/>
			)}
			<div className="w-full h-full rounded-xl p-2 transition-colors hover:bg-background-light-1">
				<div className="relative aspect-video bg-background-dark-1 rounded-xl overflow-hidden">
					<div className="w-full h-full aspect-video absolute top-0 bg-background-dark-1/75">
						{movie.details ? (
							<SearchButton
								movie={movie}
								className="w-full h-full flex justify-center"
							>
								<div className="h-full aspect-square flex justify-center">
									<img
										className="object-contain h-full rounded-sm"
										src={movie.details?.posterImage}
										alt=""
									/>
								</div>
							</SearchButton>
						) : (
							<SearchButton
								className="w-full h-full p-4 grid place-items-center"
								movie={movie}
							/>
						)}
					</div>

					<img
						className="w-full h-full object-cover"
						src={movie.details?.backgroundImage}
						alt=""
					/>
				</div>
				<div className="flex w-full rounded-b-2x pt-4 sm:pt-2 justify-between">
					<div className="flex gap-2">
						<div>
							<span className="p-2 bg-background-dark-1 rounded-md font-bold text-foreground-dark-1 text-xs whitespace-nowrap">
								{movie.serviceName}
							</span>
						</div>
						<div className="flex flex-col gap-1">
							<h2 className="text-sm font-bold line-clamp-2 min-w-0 w-full">
								{movie.title}
							</h2>
							<div className="flex gap-2">
								{movie.isWatched && (
									<div className="w-4 rounded-full border border-foreground-dark-2">
										<CheckMarkIcon />
									</div>
								)}
								<p className="text-xs text-foreground-dark-2">
									{formatRelativeDate(movie.createdAt)}に追加
								</p>
							</div>
						</div>
					</div>
					<Button
						className="has-[>svg]:p-0 text-foreground-dark-1 h-6"
						onClick={() => setIsDrawerOpen(true)}
					>
						<MoreIcon className="size-6" />
					</Button>
				</div>
			</div>
		</div>
	);
}
