"use client";

import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { MovieInfo } from "@/app/types/MovieInputForm/MovieInfo";
import { useActiveTab } from "@/app/hooks/useActiveTab";
import { Button } from "@/components/ui/button";
import WebBrowserIcon from "@/components/ui/Icons/WebBrowserIcon";
import MobileDeviceIcon from "@/components/ui/Icons/MobileDeviceIcon";
import CrossIcon from "@/components/ui/Icons/CrossIcon";
import Tab from "./Tab";
import PcForm from "./PcForm";
import MobileForm from "./MobileForm";
import MovieCard from "../MovieCard";

type Props = {
	initialIsMobile: boolean;
	userAgent: string;
	listId: number | null;
};

export default function MovieInputForm({
	initialIsMobile,
	userAgent,
	listId,
}: Props) {
	const { activeTab, setActiveTab } = useActiveTab({
		initialIsMobile,
		userAgent,
	});

	const [extractedMovie, setExtractedMovie] = useState<MovieInfo | null>(null);

	const handleExtract = (extracted: MovieInfo | null) => {
		setExtractedMovie(extracted);
	};

	const handleCloseResult = useCallback(() => {
		setExtractedMovie(null);
	}, []);

	return (
		<>
			<div className="flex flex-col items-center justify-center md:p-4 w-[90dvw] md:w-[60dvw] max-w-150 h-full max-h-[70dvh]">
				<div className="w-full h-full flex items-center">
					{activeTab === "pc" ? (
						<PcForm
							disabled={extractedMovie !== null}
							handleExtract={handleExtract}
						/>
					) : (
						<MobileForm
							disabled={extractedMovie !== null}
							handleExtract={handleExtract}
						/>
					)}
				</div>
				<div className="max-w-[50dvw] grid grid-cols-2 gap-2 border border-background-light-1 rounded-full p-1 bg-background">
					<Tab onClick={() => setActiveTab("pc")} isActive={activeTab === "pc"}>
						<WebBrowserIcon className="size-5" />
					</Tab>
					<Tab
						onClick={() => setActiveTab("mobile")}
						isActive={activeTab === "mobile"}
					>
						<MobileDeviceIcon className="size-5" />
					</Tab>
				</div>
			</div>

			<AnimatePresence>
				{extractedMovie && (
					<motion.div
						key="registered-movie"
						initial={{ y: "100%", height: 0 }}
						animate={{ y: 0, height: "90dvh" }}
						exit={{ y: "100%", height: 0 }}
						transition={{ duration: 0.2, ease: "easeOut" }}
						className="fixed inset-x-0 bottom-0 z-50 w-dvw md:max-w-145 mx-auto"
					>
						<div className="flex flex-col h-full">
							<div className="absolute w-full -top-12 flex justify-end pb-4 pr-4">
								<Button
									variant={"outline"}
									className="aspect-square rounded-full has-[>svg]:p-2"
									onClick={handleCloseResult}
								>
									<CrossIcon />
								</Button>
							</div>
							<div className="grow bg-background-dark-1 rounded-t-4xl overflow-y-auto">
								{extractedMovie && (
									<MovieCard listId={listId} movie={extractedMovie} />
								)}
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}
