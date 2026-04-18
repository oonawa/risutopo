"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useMovieAtom } from "@/features/list/state/useMovieAtom";
import { Button } from "@/components/ui/button";
import CrossIcon from "@/components/ui/Icons/CrossIcon";
import ListItemCard from "@/app/components/ListItem";
import BottomSheetContent from "@/app/components/BottomSheetContent";

export default function ListItemDetail() {
	const { movie, setMovie } = useMovieAtom();
	const router = useRouter();

	useEffect(() => {
		if (movie) {
			document.body.style.overflow = "hidden";
		}
		return () => {
			document.body.style.overflow = "";
		};
	}, [movie]);

	return (
		<AnimatePresence
			onExitComplete={() => {
				document.body.style.overflow = "";
			}}
		>
			{movie && (
				<>
					<motion.div
						key="registered-movie"
						initial={{ y: "100%", height: 0 }}
						animate={{ y: 0, height: "90dvh" }}
						exit={{ y: "100%", height: 0 }}
						transition={{ duration: 0.2, ease: "easeOut" }}
						className="fixed inset-x-0 bottom-0 z-50 w-dvw md:max-w-145 mx-auto"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="flex flex-col h-full">
							<div className="absolute w-full -top-12 flex justify-end pb-4 pr-4">
								<Button
									variant={"outline"}
									className="aspect-square rounded-full has-[>svg]:p-2"
									onClick={() => {
										setMovie(null);
									}}
								>
									<CrossIcon />
								</Button>
							</div>
							<BottomSheetContent withPadding>
								<ListItemCard
									movie={movie}
									isLoggedIn={true}
									refresh={() => {
										router.refresh();
									}}
								/>
							</BottomSheetContent>
						</div>
					</motion.div>

					<motion.div
						key="overlay"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2, ease: "easeOut" }}
						className="fixed inset-0 z-40 bg-background-dark-1/90"
						onClick={() => setMovie(null)}
					/>
				</>
			)}
		</AnimatePresence>
	);
}
