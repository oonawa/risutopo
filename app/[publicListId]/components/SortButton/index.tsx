"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import SortIcon from "@/components/ui/Icons/SortIcon";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuSub,
	DropdownMenuSubTrigger,
	DropdownMenuSubContent,
	DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import type { SortKey, SortOrder } from "@/features/list/helpers/sortListItems";

type SortSubOption = {
	label: string;
	sortOrder: SortOrder;
};

type SortGroup = {
	label: string;
	sortKey: SortKey;
	subOptions: SortSubOption[];
};

const DATE_SUB_OPTIONS: SortSubOption[] = [
	{ label: "新しい順", sortOrder: "desc" },
	{ label: "古い順", sortOrder: "asc" },
];

const DURATION_SUB_OPTIONS: SortSubOption[] = [
	{ label: "長い順", sortOrder: "desc" },
	{ label: "短い順", sortOrder: "asc" },
];

const SORT_GROUPS: SortGroup[] = [
	{ label: "追加日", sortKey: "createdAt", subOptions: DATE_SUB_OPTIONS },
	{ label: "公開日", sortKey: "releaseDate", subOptions: DATE_SUB_OPTIONS },
	{
		label: "再生時間",
		sortKey: "runningMinutes",
		subOptions: DURATION_SUB_OPTIONS,
	},
];

const DEFAULT_SORT_KEY: SortKey = "createdAt";
const DEFAULT_SORT_ORDER: SortOrder = "desc";

const VALID_SORT_KEYS = ["createdAt", "releaseDate", "runningMinutes"] as const;
const VALID_SORT_ORDERS = ["asc", "desc"] as const;

function isSortKey(value: string): value is SortKey {
	return (VALID_SORT_KEYS as readonly string[]).includes(value);
}

function isSortOrder(value: string): value is SortOrder {
	return (VALID_SORT_ORDERS as readonly string[]).includes(value);
}

export default function SortButton() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const sortParam = searchParams.get("sort");
	let activeSortKey: SortKey = DEFAULT_SORT_KEY;
	let activeSortOrder: SortOrder = DEFAULT_SORT_ORDER;
	if (sortParam) {
		const lastUnderscore = sortParam.lastIndexOf("_");
		if (lastUnderscore !== -1) {
			const keyPart = sortParam.slice(0, lastUnderscore);
			const orderPart = sortParam.slice(lastUnderscore + 1);
			if (isSortKey(keyPart) && isSortOrder(orderPart)) {
				activeSortKey = keyPart;
				activeSortOrder = orderPart;
			}
		}
	}

	const [hoveredGroupKey, setHoveredGroupKey] = useState<SortKey | null>(null);
	const [hoveredSubKey, setHoveredSubKey] = useState<string | null>(null);
	const [open, setOpen] = useState(false);

	const handleOpenChange = (isOpen: boolean) => {
		setOpen(isOpen);
		if (!isOpen) {
			setHoveredGroupKey(null);
			setHoveredSubKey(null);
		}
	};

	const handleSelect = (sortKey: SortKey, sortOrder: SortOrder) => {
		const params = new URLSearchParams(searchParams.toString());
		params.set("sort", `${sortKey}_${sortOrder}`);
		router.push(`?${params.toString()}`);
	};

	return (
		<DropdownMenu open={open} onOpenChange={handleOpenChange}>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					className="has-[>svg]:px-2 py-3 text-foreground-dark-1 flex items-center gap-1 text-xs cursor-pointer hover:bg-background-light-1"
				>
					<SortIcon className="size-5" />
					並べ替え
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="bg-background">
				{SORT_GROUPS.map((group) => {
					const isGroupActive =
						hoveredGroupKey !== null
							? hoveredGroupKey === group.sortKey
							: activeSortKey === group.sortKey;

					return (
						<DropdownMenuSub
							key={group.sortKey}
							onOpenChange={(isOpen) => {
								if (isOpen) {
									setHoveredGroupKey(group.sortKey);
								}
							}}
						>
							<DropdownMenuSubTrigger
								className={`focus:bg-background-light-1 ${isGroupActive ? "bg-background-light-1" : ""} [&>svg]:hidden`}
								data-group-active={isGroupActive ? "true" : undefined}
								style={
									isGroupActive
										? {
												backgroundColor:
													"var(--color-background-light-1, #f5f5f5)",
											}
										: undefined
								}
								onMouseEnter={() => {
									if (hoveredSubKey === null) {
										setHoveredGroupKey(group.sortKey);
									}
								}}
							>
								{group.label}
							</DropdownMenuSubTrigger>
							<DropdownMenuSubContent
								className="bg-background"
								data-group-key={group.sortKey}
							>
								{group.subOptions.map((sub) => {
									const value = `${group.sortKey}_${sub.sortOrder}`;
									const isItemActive =
										hoveredSubKey !== null
											? hoveredSubKey === value
											: activeSortKey === group.sortKey &&
												activeSortOrder === sub.sortOrder;

									return (
										<div
											key={value}
											data-item-active={isItemActive ? "true" : undefined}
										>
											<DropdownMenuItem
												onClick={() =>
													handleSelect(group.sortKey, sub.sortOrder)
												}
												className={`focus:bg-background-light-1 ${isItemActive ? "bg-background-light-1" : ""}`}
												onMouseEnter={() => {
													setHoveredGroupKey(group.sortKey);
													setHoveredSubKey(value);
												}}
												onMouseLeave={() => setHoveredSubKey(null)}
											>
												{sub.label}
											</DropdownMenuItem>
										</div>
									);
								})}
							</DropdownMenuSubContent>
						</DropdownMenuSub>
					);
				})}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
