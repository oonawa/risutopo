"use client";

import { useState, useEffect } from "react";
import { usePathname, useParams } from "next/navigation";
import { useLocalListId } from "@/features/list/hooks/useLocalListId";
import HomeIcon from "../../ui/Icons/HomeIcon";
import ListIcon from "../../ui/Icons/ListIcon";
import MenuItem from "../MenuItem";
import MenuLink from "../Link";

type Props = {
	publicListId: string | null;
};

export default function MenuContent({ publicListId }: Props) {
	const [localListId, setLocalListId] = useState<string | undefined>(undefined);

	const pathname = usePathname();
	const params = useParams<{ publicListId?: string }>();
	const { getOrCreateListId } = useLocalListId();

	useEffect(() => {
		if (publicListId) {
			return;
		}

		if (
			typeof params.publicListId === "string" &&
			params.publicListId.length > 0
		) {
			return setLocalListId(params.publicListId);
		}

		setLocalListId(getOrCreateListId());
	}, [publicListId, params.publicListId, getOrCreateListId]);

	return (
		<nav className="h-(--navigation-height) fixed bottom-(--navigation-bottom) w-full flex justify-center gap-2">
			<ul className="grid grid-cols-2 gap-2 h-full p-2 rounded-full border border-background-light-3 bg-background">
				<MenuItem isCurrentPage={pathname === "/"}>
					<MenuLink href={"/"}>
						<HomeIcon className="size-6" />
					</MenuLink>
				</MenuItem>

				<MenuItem
					isCurrentPage={
						pathname === `/${localListId}` || pathname === `/${publicListId}`
					}
				>
					<MenuLink
						href={publicListId ? `/${publicListId}` : `/${localListId}`}
						prefetch={true}
					>
						<ListIcon className="size-6" />
					</MenuLink>
				</MenuItem>
			</ul>
		</nav>
	);
}
