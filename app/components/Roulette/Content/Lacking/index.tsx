import { motion } from "motion/react";
import { Button } from "@/components/ui/button";

type Props = {
	handleClick: () => void;
	itemsNeeded: number;
};

export default function Lacking({ handleClick, itemsNeeded }: Props) {
	return (
		<motion.div
			key="is-lacking"
			initial={{ height: 0, opacity: 0 }}
			animate={{ height: "auto", opacity: 1 }}
			exit={{ height: 0, opacity: 0 }}
			transition={{ duration: 0.2, ease: "easeInOut" }}
			className="w-full overflow-hidden py-4 text-center"
		>
			<Button
				onClick={handleClick}
				className="w-full gap-2 bg-background-dark-1 rounded-2xl py-10 cursor-pointer"
			>
				<h3 className="font-bold">
					あと
					<span className="text-xl px-1">{itemsNeeded}作品</span>
					登録してください！
				</h3>
			</Button>
		</motion.div>
	);
}
