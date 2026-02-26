import { motion } from "motion/react";
import { Button } from "@/components/ui/button";

type Props = {
	onCancel: () => void;
	onContinue: () => void;
};

export default function SelectButtons({ onCancel, onContinue }: Props) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 4 }}
			animate={{
				opacity: 1,
				y: 0,
				transition: {
					duration: 0.4,
					ease: "easeOut",
					delay: 0.5,
				},
			}}
			exit={{
				opacity: 0,
				y: -4,
				transition: {
					duration: 0.4,
					ease: "easeOut",
				},
			}}
			className="fixed top-[70dvh] left-0 w-full flex justify-center"
		>
			<div className="py-4 px-12 rounded-full bg-background-dark-1 border border-background-light-2 shadow-xl/30 shadow-background-light-2">
				<h3 className="text-center font-bold">
					別作品として登録を続けますか？
				</h3>
				<div className="flex justify-center gap-8 pt-4 pb-2">
					<Button
						className="block border-background-light-2 rounded-2xl cursor-pointer"
						variant={"outline"}
						onClick={onContinue}
					>
						続行する
					</Button>
					<Button
						className="block border-background-light-2 rounded-2xl cursor-pointer"
						variant={"outline"}
						onClick={onCancel}
					>
						キャンセル
					</Button>
				</div>
			</div>
		</motion.div>
	);
}
