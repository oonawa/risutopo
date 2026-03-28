"use client";

import {
	Drawer,
	DrawerContent,
	DrawerTrigger,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "../../ui/button";
import PersonIcon from "../../ui/Icons/PersonIcon";

type Props = {
	isLoggedIn: boolean;
};

export default function DrawerMenu({ isLoggedIn }: Props) {
	return (
		<Drawer>
			<DrawerTrigger asChild>
				<Button className="has-[>svg]:p-0 aspect-square h-full border border-background-light-1 rounded-full cursor-pointer hover:bg-background-light-1">
					<PersonIcon className="size-4 text-foreground-dark-2" />
				</Button>
			</DrawerTrigger>

			<DrawerContent className="data-[vaul-drawer-direction=bottom]:border-t-0 pb-16">
				<DrawerHeader>
					<DrawerTitle className="text-xl font-bold text-foreground-dark-2">
						メニュー
					</DrawerTitle>
				</DrawerHeader>

				<div className="flex justify-center">
					<div className="flex flex-col items-center gap-4 px-4 w-full sm:max-w-[40dvw]">
						{isLoggedIn ? (
							<>
								<Button
									variant={"outline"}
									className="w-full rounded-full border-background-light-1 hover:bg-background-light-1"
								>
									ログアウト
								</Button>
								<Button
									variant={"outline"}
									className="w-full rounded-full border-red-light-2 hover:bg-red-light-1"
								>
									アカウント削除
								</Button>
							</>
						) : (
							<Button
								variant={"outline"}
								className="w-full rounded-full border-background-light-1 hover:bg-background-light-1"
							>
								ログイン
							</Button>
						)}
					</div>
				</div>
			</DrawerContent>
		</Drawer>
	);
}
