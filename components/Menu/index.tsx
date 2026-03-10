"use client";

import { useState, useEffect } from "react";
import { usePathname, useParams } from "next/navigation";
import { useLocalListId } from "@/features/list/hooks/useLocalListId";
import AddCircleIcon from "../ui/Icons/AddIcon";
import ListIcon from "../ui/Icons/ListIcon";
import MenuItem from "./MenuItem";

type Props = {
	listPublicId: string | null;
};

export default function Menu({ listPublicId }: Props) {
	const [localListId, setLocalListId] = useState<string | undefined>(undefined);

	const pathname = usePathname();
	const params = useParams<{ publicListId?: string }>();
	const { getOrCreateListId } = useLocalListId();

	useEffect(() => {
		if (listPublicId) {
			return;
		}

		if (
			typeof params.publicListId === "string" &&
			params.publicListId.length > 0
		) {
			return setLocalListId(params.publicListId);
		}

		setLocalListId(getOrCreateListId());
	}, [listPublicId, params.publicListId, getOrCreateListId]);

	return (
		<nav className="h-(--navigation-height) fixed bottom-(--navigation-bottom) w-full flex justify-center">
			<ul className="grid grid-cols-2 gap-2 w-[50dvw] sm:w-[20dvw] h-full p-2 rounded-full border border-background-light-3 bg-background">
				<MenuItem href="/" isCurrentPage={pathname === "/"}>
					<AddCircleIcon className="size-6" />
				</MenuItem>

				<MenuItem
					href={listPublicId ? `/${listPublicId}` : `/${localListId}`}
					prefetch={true}
					isCurrentPage={
						pathname === `/${localListId}` || pathname === `/${listPublicId}`
					}
				>
					<ListIcon className="size-6" />
				</MenuItem>
			</ul>
		</nav>
	);
}
