"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, useAnimate } from "motion/react";
import type { ListItem } from "@/features/list/types/ListItem";
import { getListItemById } from "@/features/list/actions/getListItemById";
import { useListLocalStorageRepository } from "@/features/list/repositories/client/useListLocalStorageRepository";
import RisuPot from "@/components/RisuPot";
import { Button } from "@/components/ui/button";

const Lacking = dynamic(() => import("./Lacking"));
const SelectedItem = dynamic(() => import("./SelectedItem"));

type Props = {
	listItemIds?: string[];
};

export default function RouletteContent({ listItemIds }: Props) {
	const { getListItems } = useListLocalStorageRepository();

	const [isLacking, setIsLacking] = useState(false);
	const [isDisabled, setIsDisabled] = useState(false);
	const [selectedItem, setSelectedItem] = useState<ListItem | null>(null);
	const [isAnimating, setIsAnimating] = useState(false);
	const [potScope, animatePot] = useAnimate();

	const localItems = listItemIds ? [] : getListItems();
	const ids = listItemIds ?? localItems.map((i) => i.listItemId);

	const MIN_ITEMS_REQUIRED = 2 as const;

	const getRandomItem = async () => {
		if (isAnimating) {
			return;
		}

		if (ids.length < MIN_ITEMS_REQUIRED) {
			return setIsLacking(true);
		}

		setIsAnimating(true);

		const randomId = ids[Math.floor(Math.random() * ids.length)];

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
	};

	return (
		<div className="flex flex-col items-center justify-center rounded-2xl">
			<Button
				onClick={getRandomItem}
				disabled={isDisabled || isLacking}
				className="cursor-pointer w-full h-full border border-background-light-3 rounded-2xl text-foreground-dark-2 hover:bg-background-light-1 hover:text-foreground"
			>
				<div className="flex flex-col items-center pb-2">
					<div ref={potScope} className="origin-center">
						<RisuPot className="size-20 text-foreground-dark-1" />
					</div>
					<h3 className="font-bold">ランダムに選ぶ！</h3>
				</div>
			</Button>

			<AnimatePresence initial={false}>
				{isLacking && (
					<Lacking
						handleClick={() => {
							setIsLacking(false);
						}}
						itemsNeeded={MIN_ITEMS_REQUIRED - ids.length}
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
		</div>
	);
}
