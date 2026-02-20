"use client";

import { useCallback, useState, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { MovieInfo } from "@/app/types/MovieInputForm/MovieInfo";
import { useActiveTab } from "@/app/hooks/useActiveTab";
import { useMovieForm } from "@/app/hooks/useMovieForm";
import type { MovieInputValues } from "@/app/types/MovieInputForm/MovieInputValues";
import WebBrowserIcon from "@/components/ui/Icons/WebBrowserIcon";
import MobileDeviceIcon from "@/components/ui/Icons/MobileDeviceIcon";
import Tab from "./Tab";
import PcForm from "./PcForm";
import MobileForm from "./MobileForm";
import RegisteredMovie from "./Result/RegisteredMovie";
import { Button } from "@/components/ui/button";
import CrossIcon from "@/components/ui/Icons/CrossIcon";

type Props = {
	initialIsMobile: boolean;
	userAgent: string;
	listId: number | null;
};

type SharedHandlerInput = {
	isValid: boolean;
};

type MobileSubmitInput = {
	shareLink: string;
} & SharedHandlerInput;

type PcChangeInput = {
	values: { title: string; url: string };
} & SharedHandlerInput;

type HandleBuildValues<TInput> = (input: TInput) => MovieInputValues;

export default function MovieInputForm({
	initialIsMobile,
	userAgent,
	listId,
}: Props) {
	const [isPending, startTransition] = useTransition();

	const { activeTab, setActiveTab } = useActiveTab({
		initialIsMobile,
		userAgent,
	});

	const debounceMs = 300;

	const { storageErrorMessage, handleValueChange } = useMovieForm({
		listId,
		debounceMs,
	});

	const [registeredMovie, setRegisteredMovie] = useState<MovieInfo | null>(
		null,
	);

	const handleSubmit = useCallback(
		<TInput,>(
			isValid: boolean,
			input: TInput,
			buildValues: HandleBuildValues<TInput>,
		) => {
			if (!isValid) {
				return;
			}

			startTransition(async () => {
				const values = buildValues(input);
				const result = await handleValueChange({
					values,
				});

				if (result === null || !result.success) {
					return;
				}

				setRegisteredMovie(result.data);
			});
		},
		[handleValueChange],
	);

	const handleMobileSubmit = useCallback(
		async ({ shareLink, isValid }: MobileSubmitInput) => {
			return await handleSubmit(
				isValid,
				{ shareLink },
				({ shareLink: link }) => ({
					mobile: { shareLink: link },
				}),
			);
		},
		[handleSubmit],
	);

	const handlePcChange = useCallback(
		async ({ values, isValid }: PcChangeInput) => {
			return await handleSubmit(isValid, values, (browserValues) => ({
				browser: browserValues,
			}));
		},
		[handleSubmit],
	);

	const handleCloseResult = useCallback(() => {
		setRegisteredMovie(null);
	}, []);

	return (
		<>
			<div className="flex flex-col items-center justify-center md:p-4 w-[90dvw] md:w-[60dvw] max-w-150 h-full max-h-[70dvh]">
				<div className="w-full h-full flex items-center">
					{activeTab === "pc" ? (
						<PcForm
							disabled={isPending}
							onSubmit={handlePcChange}
							storageErrorMessage={storageErrorMessage}
						/>
					) : (
						<MobileForm
							disabled={isPending}
							onSubmit={handleMobileSubmit}
							storageErrorMessage={storageErrorMessage}
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
				{isPending || registeredMovie ? (
					<motion.div
						key="registered-movie"
						initial={{ y: "100%", height: 0 }}
						animate={{ y: 0, height: "90dvh" }}
						exit={{ y: "100%", height: 0 }}
						transition={{ duration: 0.2, ease: "easeOut" }}
						className="fixed inset-x-0 bottom-0 z-50 sm:w-[50dvw] mx-auto"
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
								{registeredMovie && <RegisteredMovie movie={registeredMovie} />}
							</div>
						</div>
					</motion.div>
				) : null}
			</AnimatePresence>
		</>
	);
}
