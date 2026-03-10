import { motion } from "motion/react";
import LoadingAnimation from "@/components/Loading";

export default function Loading() {
	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.3 }}
			className="w-full aspect-square flex justify-center items-center"
		>
			<LoadingAnimation />
		</motion.div>
	);
}
