"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { renameSubList } from "@/features/list/actions/renameSubList";
import { useServerAction } from "@/features/shared/hooks/useServerAction";
import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import EditIcon from "@/components/ui/Icons/EditIcon";
import { useListLocalStorageRepository } from "@/features/list/repositories/client/useListLocalStorageRepository";

type Props = {
	subListPublicId: string;
	subListName: string;
	isLoggedIn: boolean;
};

export default function SubListRenameButton({
	subListPublicId,
	subListName,
	isLoggedIn,
}: Props) {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [name, setName] = useState(subListName);
	const router = useRouter();
	const { execute, isPending } = useServerAction();
	const { renameSubList: renameLocalSubList } = useListLocalStorageRepository();

	const handleOpen = () => {
		setName(subListName);
		setIsDialogOpen(true);
	};

	const handleConfirm = () => {
		execute(async () => {
			if (isLoggedIn) {
				const result = await renameSubList({ subListPublicId, name });
				if (result.success) {
					setIsDialogOpen(false);
					router.refresh();
				}
			} else {
				renameLocalSubList(subListPublicId, name);
				setIsDialogOpen(false);
				router.refresh();
			}
		});
	};

	return (
		<>
			<Button
				variant="outline"
				aria-label="サブリスト名を変更"
				onClick={handleOpen}
				className="flex items-center gap-1 border-background-light-2"
			>
				<EditIcon className="size-4" />
				{isPending && <Loading />}
			</Button>
			<Dialog
				open={isDialogOpen}
				onOpenChange={(open) => {
					if (!open) setIsDialogOpen(false);
				}}
			>
				<DialogContent className="border-background-light-2 pb-10">
					<DialogHeader className="items-center pt-4 pb-2">
						<DialogTitle>サブリスト名を変更</DialogTitle>
					</DialogHeader>
					<div className="pb-4">
						<Input
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="サブリスト名"
							className="w-full border border-background-light-2 rounded-md p-2 bg-transparent text-foreground placeholder:text-foreground-dark-2 focus:outline-none focus:border-background-light-2 focus-visible:ring-background-light-3"
						/>
					</div>
					<Button
						disabled={isPending}
						onClick={handleConfirm}
						className="cursor-pointer font-bold bg-background-light-1 hover:bg-background-light-2"
					>
						変更
					</Button>
					<Button
						variant={"outline"}
						onClick={() => setIsDialogOpen(false)}
						className="border-background-light-2 cursor-pointer text-foreground-dark-1 hover:bg-background-light-1 hover:border-background-light-3"
					>
						キャンセル
					</Button>
				</DialogContent>
			</Dialog>
		</>
	);
}
