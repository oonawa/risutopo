"use client";

import { useParams, usePathname } from "next/navigation";
import AddCircleIcon from "../ui/Icons/AddIcon";
import ListIcon from "../ui/Icons/ListIcon";
import MenuItem from "./MenuItem";

type Props = {
	listPublicId: string | null;
};

export default function Menu({ listPublicId }: Props) {
	const pathname = usePathname();
	const params = useParams<{ publicListId?: string }>();

	const isPublicListPage =
		typeof params.publicListId === "string" && params.publicListId.length > 0;

	return (
		<nav className="h-(--navigation-height) fixed bottom-(--navigation-bottom) w-full flex justify-center">
			<ul className="grid grid-cols-2 gap-2 w-[50dvw] sm:w-[20dvw] h-full p-2 rounded-full border border-background-light-3 bg-background">
				<MenuItem isCurrentPage={pathname === "/"}>
					<a href="/">
						<AddCircleIcon className="size-6" />
					</a>
				</MenuItem>

				<MenuItem isCurrentPage={isPublicListPage}>
					<a href={`/${listPublicId}`}>
						<ListIcon className="size-6" />
					</a>
				</MenuItem>
			</ul>
		</nav>
	);
}
