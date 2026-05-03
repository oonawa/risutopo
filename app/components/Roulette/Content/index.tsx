"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, useAnimate } from "motion/react";
import type { ListItem } from "@/features/list/types/ListItem";
import { getListItemById } from "@/features/list/actions/getListItemById";
import { getRouletteListItemIdsBySubList } from "@/features/list/actions/getRouletteListItemIdsBySubList";
import { useServerAction } from "@/features/shared/hooks/useServerAction";
import { useListLocalStorageRepository } from "@/features/list/repositories/client/useListLocalStorageRepository";
import RisuPot from "@/components/RisuPot";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

const Lacking = dynamic(() => import("./Lacking"));
const SelectedItem = dynamic(() => import("./SelectedItem"));

const ALL_ITEMS_VALUE = "all" as const;

type SubList = { publicId: string; name: string };

type Props = {
	listItemIds?: string[];
	subLists?: SubList[];
};

const MIN_ITEMS_REQUIRED = 2 as const;

export default function RouletteContent({ listItemIds, subLists }: Props) {
	const { getListItems, getSubLists } = useListLocalStorageRepository();
	const { execute, networkError } = useServerAction();

	const [isLacking, setIsLacking] = useState(false);
	const [lackingCount, setLackingCount] = useState<number>(MIN_ITEMS_REQUIRED);
	const [isDisabled, setIsDisabled] = useState(false);
	const [selectedItem, setSelectedItem] = useState<ListItem | null>(null);
	const [isAnimating, setIsAnimating] = useState(false);
	const [selectedSubListId, setSelectedSubListId] =
		useState<string>(ALL_ITEMS_VALUE);
	const [potScope, animatePot] = useAnimate();

	const localItems = listItemIds ? [] : getListItems();
	const localSubLists = subLists ? [] : getSubLists();
	const allSubLists: SubList[] =
		subLists ??
		localSubLists.map((s) => ({ publicId: s.subListId, name: s.name }));

	const getIds = (): string[] => {
		if (selectedSubListId !== ALL_ITEMS_VALUE) {
			const localSub = localSubLists.find(
				(s) => s.subListId === selectedSubListId,
			);
			if (localSub) return localSub.listItemIds;
		}
		return listItemIds ?? localItems.map((i) => i.listItemId);
	};

	const ids = getIds();

	const getRandomItem = () => {
		if (isAnimating) {
			return;
		}

		// ゲストまたは「すべて」選択時は同期チェック可能
		const isLoginUserWithSubList =
			listItemIds !== undefined && selectedSubListId !== ALL_ITEMS_VALUE;

		if (!isLoginUserWithSubList && ids.length < MIN_ITEMS_REQUIRED) {
			setLackingCount(MIN_ITEMS_REQUIRED - ids.length);
			return setIsLacking(true);
		}

		setIsAnimating(true);

		execute(async () => {
			// ログインユーザーがサブリストを選択している場合はサーバーからIDを取得
			let pool: string[];
			if (isLoginUserWithSubList) {
				const result = await getRouletteListItemIdsBySubList(selectedSubListId);
				if (!result.success) {
					setIsAnimating(false);
					return;
				}
				pool = result.data;
				if (pool.length < MIN_ITEMS_REQUIRED) {
					setIsAnimating(false);
					setLackingCount(MIN_ITEMS_REQUIRED - pool.length);
					setIsLacking(true);
					return;
				}
			} else {
				pool = ids;
			}

			const randomId = pool[Math.floor(Math.random() * pool.length)];

			const itemPromise: Promise<ListItem | null> = listItemIds
				? getListItemById(randomId).then((r) => (r.success ? r.data : null))
				: Promise.resolve(
						localItems.find((i) => i.listItemId === randomId) ?? null,
					);

			await animatePot(
				potScope.current,
				{ rotate: [0, -16, 16, -13, 13, -10, 10, 0] },
				{ duration: 1, ease: "easeInOut" },
			);
			await animatePot(
				potScope.current,
				{ rotate: [0, 160] },
				{ duration: 0.35, ease: "easeInOut" },
			);
			await animatePot(
				potScope.current,
				{ y: [0, -10, 10, -10, 10, 0] },
				{ duration: 0.5, ease: "easeInOut" },
			);

			const selected = await itemPromise;
			setSelectedItem(selected);

			await animatePot(
				potScope.current,
				{ rotate: 0, y: 0 },
				{ duration: 0.2, ease: "easeOut" },
			);

			setTimeout(() => {
				setIsAnimating(false);
				setIsDisabled(true);
			}, 300);
		});
	};

	return (
		<>
			{allSubLists.length > 0 && (
				<div className="w-full flex justify-end">
					<Select
						value={selectedSubListId}
						onValueChange={(value) => {
							setSelectedSubListId(value);
							setIsLacking(false);
							setIsDisabled(false);
							setSelectedItem(null);
						}}
					>
						<SelectTrigger className="border-background-light-2 overflow-hidden *:data-[slot=select-value]:inline-block *:data-[slot=select-value]:truncate">
							<SelectValue />
						</SelectTrigger>
						<SelectContent
							position="popper"
							align="end"
							className="max-w-full bg-background"
						>
							<SelectItem value={ALL_ITEMS_VALUE}>すべて</SelectItem>
							{allSubLists.map((s) => (
								<SelectItem key={s.publicId} value={s.publicId}>
									{s.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			)}
			<div className="pt-2">
				<Button
					variant={"outline"}
					onClick={getRandomItem}
					disabled={isDisabled || isLacking}
					className="cursor-pointer w-full h-full rounded-md border-background-light-2 hover:bg-background-light-1 hover:ring-2 hover:ring-background-light-3"
				>
					<div className="flex flex-col items-center pb-2">
						<div ref={potScope} className="origin-center">
							<RisuPot className="size-20 text-foreground-dark-1" />
						</div>
						<h3 className="font-bold">ランダムに選ぶ！</h3>
					</div>
				</Button>
			</div>

			{networkError && (
				<p className="mt-2 text-sm text-red-500">{networkError}</p>
			)}

			<AnimatePresence initial={false}>
				{isLacking && (
					<Lacking
						handleClick={() => {
							setIsLacking(false);
						}}
						itemsNeeded={lackingCount}
					/>
				)}

				{selectedItem && (
					<SelectedItem
						selectedItem={selectedItem}
						handleClick={() => {
							setSelectedItem(null);
							setIsDisabled(false);
						}}
					/>
				)}
			</AnimatePresence>
		</>
	);
}
