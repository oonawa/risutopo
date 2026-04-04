import { motion } from "motion/react";
import type { DraftListItem } from "@/features/list/types/ListItem";
import ListItemCard from "../../ListItem";

type Props = {
	draft: DraftListItem;
	isLoggedIn: boolean;
};

export default function DraftNewItem({ draft, isLoggedIn }: Props) {
	return (
		<motion.div
			key="extracted-movie"
			initial={{ opacity: 0, y: 4 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -4 }}
			transition={{ duration: 0.2, ease: "easeOut" }}
			className="pt-4 px-4"
		>
			<ListItemCard
				mode="extracted"
				movie={draft}
				isLoggedIn={isLoggedIn}
			/>
		</motion.div>
	);
}
