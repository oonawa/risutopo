"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useAnimate } from "motion/react";
import type { ListItem } from "@/features/list/types/ListItem";
import RisuPot from "@/components/RisuPot";
import { Button } from "@/components/ui/button";
import { useListLocalStorageRepository } from "@/features/list/repositories/client/useListLocalStorageRepository";
import ListItemCard from "../ListItem";

export default function Roulette() {
	const [items, setItems] = useState<ListItem[]>([]);
	const [isLacking, setIsLacking] = useState(false);
	const [isDisabled, setIsDisabled] = useState(false);
	const [selectedItem, setSelectedItem] = useState<ListItem | null>(null);
	const [isAnimating, setIsAnimating] = useState(false);
	const [potScope, animatePot] = useAnimate();
	const { getListItems, getListId } = useListLocalStorageRepository();

	useEffect(() => {
		const items = getListItems();
		setItems(items);
	}, [getListItems]);

	const getRandomItem = async () => {
		if (isAnimating) {
			return;
		}

		if (items.length < 2) {
			return setIsLacking(true);
		}

		setIsAnimating(true);
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

		const selected = items[Math.floor(Math.random() * items.length)];
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
					<motion.div ref={potScope} className="origin-center">
						<RisuPot className="size-20 text-foreground-dark-1" />
					</motion.div>
					<h3 className="font-bold">ランダムに選ぶ！</h3>
				</div>
			</Button>

			<AnimatePresence initial={false}>
				{isLacking && (
					<motion.div
						key="is-lacking"
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.3, ease: "easeInOut" }}
						className="w-full overflow-hidden py-4 text-center"
					>
						<div className="w-full bg-background-dark-2 rounded-2xl py-10">
							<h3 className="font-bold">
								あと
								<span className="text-xl px-1">{2 - items.length}本</span>
								リスト登録してください！
							</h3>
						</div>
					</motion.div>
				)}

				{selectedItem && (
					<motion.div
						key="selected-item"
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.3, ease: "easeInOut" }}
						className="w-full max-w-lg overflow-hidden"
					>
						<div className="pt-6 pb-4 w-full">
							<ListItemCard
								mode="drawing"
								movie={selectedItem}
								publicListId={getListId()}
							/>
						</div>
						<div className="border-t border-background-light-2 pt-10 pb-6">
							<Button
								onClick={() => {
									setSelectedItem(null);
									setIsDisabled(false);
								}}
								className="w-full cursor-pointer border border-background-light-1 text-foreground-dark-1 bg-background-light-1 hover:bg-background-light-2 hover:text-foreground transition-colors"
							>
								<span className="font-bold">もういちど</span>
							</Button>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
