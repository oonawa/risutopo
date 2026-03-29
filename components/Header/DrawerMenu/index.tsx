"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { logout } from "@/features/auth/actions/logout";
import {
	Drawer,
	DrawerContent,
	DrawerTrigger,
	DrawerHeader,
	DrawerTitle,
	DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "../../ui/button";
import PersonIcon from "../../ui/Icons/PersonIcon";

type Props = {
	isLoggedIn: boolean;
};

export default function DrawerMenu({ isLoggedIn }: Props) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	const onLogout = () => {
		startTransition(async () => {
			await logout();
			router.push("/?home=true");
		});
	};

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
									onClick={onLogout}
									disabled={isPending}
									variant={"outline"}
									className="w-full rounded-full border-background-light-1 hover:bg-background-light-1"
								>
									ログアウト
								</Button>

								<DrawerClose asChild>
									<Button
										onClick={() => router.push("/account-delete/verify")}
										disabled={isPending}
										variant={"outline"}
										className="w-full rounded-full border-red-light-2 hover:bg-red-light-1"
									>
										アカウント削除
									</Button>
								</DrawerClose>
							</>
						) : (
							<DrawerClose asChild>
								<Link
									href={"/login"}
									className="flex justify-center py-2 w-full rounded-full border border-background-light-1 hover:bg-background-light-1"
								>
									ログイン
								</Link>
							</DrawerClose>
						)}
					</div>
				</div>
			</DrawerContent>
		</Drawer>
	);
}
