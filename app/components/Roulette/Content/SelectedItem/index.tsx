import type { ListItem } from "@/features/list/types/ListItem";
import { motion } from "motion/react";
import DrawnListItem from "@/app/components/ListItem/Drawn";
import { Button } from "@/components/ui/button";

type Props = {
	selectedItem: ListItem;
	handleClick: () => void;
};

export default function SelectedItem({ selectedItem, handleClick }: Props) {
	return (
		<motion.div
			key="selected-item"
			initial={{ height: 0, opacity: 0 }}
			animate={{ height: "auto", opacity: 1 }}
			exit={{ height: 0, opacity: 0 }}
			transition={{ duration: 0.3, ease: "easeInOut" }}
			className="w-full max-w-lg overflow-hidden"
		>
			<div className="pt-6 pb-4 w-full">
				<DrawnListItem movie={selectedItem} />
			</div>
			<div className="border-t border-background-light-2 pt-10 pb-6">
				<Button
					onClick={handleClick}
					className="w-full cursor-pointer border border-background-light-1 text-foreground-dark-1 bg-background-light-1 hover:bg-background-light-2 hover:text-foreground transition-colors"
				>
					<span className="font-bold">もういちど</span>
				</Button>
			</div>
		</motion.div>
	);
}
