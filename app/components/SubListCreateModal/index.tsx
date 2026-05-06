"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createSubList } from "@/features/list/actions/createSubList";
import { useListLocalStorageRepository } from "@/features/list/hooks/useListLocalStorageRepository";

type Props = {
	isOpen: boolean;
	onClose: () => void;
	publicListId: string;
	isLoggedIn: boolean;
};

export default function SubListCreateModal({
	isOpen,
	onClose,
	publicListId,
	isLoggedIn,
}: Props) {
	const [name, setName] = useState("");
	const [isPending, startTransition] = useTransition();
	const router = useRouter();
	const { createSubList: createLocalSubList } = useListLocalStorageRepository();

	const handleSubmit = () => {
		const trimmedName = name.trim();
		if (!trimmedName) return;

		startTransition(async () => {
			if (isLoggedIn) {
				const result = await createSubList({
					publicListId,
					name: trimmedName,
				});
				if (result.success) {
					onClose();
					setName("");
					router.push(`/${result.data.subListPublicId}`);
				}
			} else {
				const subListId = createLocalSubList(trimmedName);
				onClose();
				setName("");
				router.push(`/${subListId}`);
			}
		});
	};

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(open) => {
				if (!open) onClose();
			}}
		>
			<DialogContent className="border-background-light-2 pb-10">
				<DialogHeader className="items-center pt-4 pb-2">
					<DialogTitle>新しいサブリストを作成</DialogTitle>
				</DialogHeader>
				<div className="pb-4">
					<Input
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder="サブリスト名（50文字以内）"
						maxLength={50}
						className="w-full border border-background-light-2 rounded-md p-2 bg-transparent text-foreground placeholder:text-foreground-dark-2 focus:outline-none focus:border-background-light-2 focus-visible:ring-background-light-3"
					/>
				</div>
				<Button
					disabled={isPending || !name.trim()}
					onClick={handleSubmit}
					className="cursor-pointer font-bold bg-background-light-1 hover:bg-background-light-2"
				>
					作成する
				</Button>
				<Button
					variant={"outline"}
					onClick={onClose}
					className="border-background-light-2 cursor-pointer text-foreground-dark-1 hover:bg-background-light-1 hover:border-background-light-3"
				>
					キャンセル
				</Button>
			</DialogContent>
		</Dialog>
	);
}
