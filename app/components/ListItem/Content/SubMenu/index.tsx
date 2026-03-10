"use client";

import { useState } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import MoreIcon from "@/components/ui/Icons/MoreIcon";

type Props = {
	onSearch: () => void;
	onRemove?: () => void;
	searchDisabled: boolean;
	removeDisabled: boolean;
};

export default function SubMenu({
	onSearch,
	onRemove,
	searchDisabled,
	removeDisabled,
}: Props) {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

	return (
		<>
			<DropdownMenu
				open={isMenuOpen}
				onOpenChange={setIsMenuOpen}
				modal={false}
			>
				<DropdownMenuTrigger asChild>
					<Button
						variant="outline"
						className="h-10.5 aspect-square has-[>svg]:p-0 border border-background-light-1 bg-transparent cursor-pointer text-foreground-dark-1 hover:text-foreground hover:bg-background-light-2"
					>
						<MoreIcon className="size-6" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent className="bg-background-light-1 border-background-light-4">
					<DropdownMenuItem
						disabled={searchDisabled}
						onClick={() => {
							onSearch();
						}}
						className="p-1"
					>
						<div className="font-bold w-full p-2 rounded-sm hover:bg-background-light-2">
							ポスターをさがす
						</div>
					</DropdownMenuItem>
					{onRemove && (
						<DropdownMenuItem
							onSelect={(event) => {
								event.preventDefault();
								setIsDeleteDialogOpen(true);
							}}
							className="p-1"
						>
							<div className="font-bold w-full p-2 rounded-sm bg-red-light-2/50 hover:bg-red-light-2">
								削除する
							</div>
						</DropdownMenuItem>
					)}
				</DropdownMenuContent>
			</DropdownMenu>

			<Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<DialogContent className="border-background-light-2 pb-10">
					<DialogHeader className="items-center pt-4 pb-2">
						<DialogTitle>削除しますか？</DialogTitle>
					</DialogHeader>
					<Button
						disabled={removeDisabled}
						variant="outline"
						onClick={() => {
							onRemove?.();
							setIsDeleteDialogOpen(false);
							setIsMenuOpen(false);
						}}
						className="cursor-pointer border-red-light-2 text-red-light-2 font-bold hover:text-foreground hover:bg-red-light-2/50"
					>
						削除する
					</Button>
					<Button
						variant="outline"
						onClick={() => {
							setIsDeleteDialogOpen(false);
						}}
						className="cursor-pointer border-background-light-2 text-foreground-dark-1 hover:bg-background-light-1 hover:border-background-light-3"
					>
						キャンセル
					</Button>
				</DialogContent>
			</Dialog>
		</>
	);
}
