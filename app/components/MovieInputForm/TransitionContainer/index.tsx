import { motion } from "motion/react";
import type { ComponentProps } from "react";

type Props = {
	children: React.ReactNode;
	duration?: number;
	key: string;
} & ComponentProps<"div">;

export default function TransitionContainer({
	children,
	duration = 0.2,
	...props
}: Props) {
	return (
		<div {...props}>
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				transition={{ duration }}
			>
				{children}
			</motion.div>
		</div>
	);
}
