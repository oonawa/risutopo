"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { deleteSubList } from "@/features/list/actions/deleteSubList";
import { useServerAction } from "@/features/shared/hooks/useServerAction";
import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import RemoveIcon from "@/components/ui/Icons/RemoveIcon";
import { useListLocalStorageRepository } from "@/features/list/repositories/client/useListLocalStorageRepository";

type Props = {
	subListPublicId: string;
	mainListPublicId: string;
	isLoggedIn: boolean;
};

export default function SubListDeleteButton({
	subListPublicId,
	mainListPublicId,
	isLoggedIn,
}: Props) {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const router = useRouter();
	const { execute, isPending } = useServerAction();
	const { deleteSubList: deleteLocalSubList } = useListLocalStorageRepository();

	const handleConfirm = () => {
		execute(async () => {
			if (isLoggedIn) {
				const result = await deleteSubList({ subListPublicId });
				if (result.success) {
					setIsDialogOpen(false);
					router.push(`/${mainListPublicId}`);
				}
			} else {
				deleteLocalSubList(subListPublicId);
				setIsDialogOpen(false);
				router.push(`/${mainListPublicId}`);
			}
		});
	};

	return (
		<>
			<Button
				variant="outline"
				aria-label="サブリストを削除"
				onClick={() => setIsDialogOpen(true)}
				className="flex items-center gap-1 border-background-light-2"
			>
				<RemoveIcon className="size-4" />
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
						<DialogTitle>サブリストを削除しますか？</DialogTitle>
					</DialogHeader>
					<Button
						disabled={isPending}
						onClick={handleConfirm}
						className="cursor-pointer font-bold bg-background-light-1 hover:bg-background-light-2"
					>
						削除する
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
