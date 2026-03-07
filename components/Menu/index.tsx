"use client";

import { useEffect, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import { useLocalListId } from "@/features/list/hooks/useLocalListId";
import AddCircleIcon from "../ui/Icons/AddIcon";
import ListIcon from "../ui/Icons/ListIcon";
import MenuItem from "./MenuItem";

type Props = {
	listPublicId: string | null;
};

export default function Menu({ listPublicId }: Props) {
	const [localListId, setLocalListId] = useState("");

	const pathname = usePathname();

	const params = useParams<{ publicListId?: string }>();

	const { getOrCreateListId } = useLocalListId();

	useEffect(() => {
		if (
			typeof params.publicListId === "string" &&
			params.publicListId.length > 0
		) {
			return setLocalListId(params.publicListId);
		}

		setLocalListId(getOrCreateListId());
	}, [params.publicListId, getOrCreateListId]);

	return (
		<nav className="h-(--navigation-height) fixed bottom-(--navigation-bottom) w-full flex justify-center">
			<ul className="grid grid-cols-2 gap-2 w-[50dvw] sm:w-[20dvw] h-full p-2 rounded-full border border-background-light-3 bg-background">
				<MenuItem isCurrentPage={pathname === "/"}>
					<a href="/">
						<AddCircleIcon className="size-6" />
					</a>
				</MenuItem>

				<MenuItem isCurrentPage={listPublicId !== null}>
					<a href={listPublicId ? `/${listPublicId}` : `/${localListId}`}>
						<ListIcon className="size-6" />
					</a>
				</MenuItem>
			</ul>
		</nav>
	);
}
