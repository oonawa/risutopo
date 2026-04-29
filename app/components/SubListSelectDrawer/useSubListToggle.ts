"use client";

import { useState, useTransition } from "react";

type UseSubListToggleParams = {
	initialCheckedIds: string[];
	onAdd: (subListId: string) => void | Promise<unknown>;
	onRemove: (subListId: string) => void | Promise<unknown>;
};

type UseSubListToggleReturn = {
	checkedIds: Set<string>;
	isPending: boolean;
	handleToggle: (publicId: string) => void;
};

export function useSubListToggle({
	initialCheckedIds,
	onAdd,
	onRemove,
}: UseSubListToggleParams): UseSubListToggleReturn {
	const [checkedIds, setCheckedIds] = useState<Set<string>>(
		new Set(initialCheckedIds),
	);
	const [isPending, startTransition] = useTransition();

	const handleToggle = (publicId: string) => {
		const isChecked = checkedIds.has(publicId);

		setCheckedIds((prev) => {
			const next = new Set(prev);
			if (isChecked) {
				next.delete(publicId);
			} else {
				next.add(publicId);
			}
			return next;
		});

		startTransition(() => {
			if (isChecked) {
				onRemove(publicId);
			} else {
				onAdd(publicId);
			}
		});
	};

	return { checkedIds, isPending, handleToggle };
}
