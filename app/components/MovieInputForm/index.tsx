"use client";

import { useCallback, useState, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { ListItem } from "@/features/list/types/ListItem";
import { useActiveTab } from "@/features/list/hooks/useActiveTab";
import { useLocalStorage } from "@/features/list/hooks/useLocalStorage";
import { Button } from "@/components/ui/button";
import WebBrowserIcon from "@/components/ui/Icons/WebBrowserIcon";
import MobileDeviceIcon from "@/components/ui/Icons/MobileDeviceIcon";
import CrossIcon from "@/components/ui/Icons/CrossIcon";
import Tab from "./Tab";
import PcForm from "./PcForm";
import MobileForm from "./MobileForm";
import MovieCard from "../MovieCard";
import ExistingListItemDetail from "./ExistingItem/Detail";
import SelectButtons from "./SelectButtons";

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

	const { hydrateLocalStorageFromDb, getMovieService } = useLocalStorage();

	const [extractedMovie, setExtractedMovie] = useState<ListItem | null>(null);

	const [duplicateListItems, setDuplicateListItems] = useState<
		ListItem[] | null
	>(null);
	const [sameMovie, setSameMovie] = useState<ListItem | null>(null);

	const [searchExistingMoviePending, searchExistingMovieTransition] =
		useTransition();

	const handleExtract = (extracted: ListItem | null) => {
		searchExistingMovieTransition(async () => {
			if (!extracted) {
				setExtractedMovie(null);
				setDuplicateListItems(null);
				setSameMovie(null);
				return;
			}

			setExtractedMovie(extracted);

			const movieService = await (async () => {
				const cachedMovieService = getMovieService();
				if (!listId || cachedMovieService.length > 0) {
					return cachedMovieService;
				}

				await hydrateLocalStorageFromDb({ listId });
				return getMovieService();
			})();

			const extractedExternalMovieId =
				extracted.details?.externalDatabaseMovieId;

			const duplicatedMovies = movieService.filter((cachedMovie) => {
				if (
					extracted.listItemId !== undefined &&
					cachedMovie.listItemId === extracted.listItemId
				) {
					return false;
				}

				const hasSameWatchUrl = cachedMovie.url === extracted.url;
				const hasSameTitle = cachedMovie.title === extracted.title;
				const hasSameExternalMovieId =
					extractedExternalMovieId !== undefined &&
					cachedMovie.details?.externalDatabaseMovieId ===
						extractedExternalMovieId;

				return hasSameWatchUrl || hasSameTitle || hasSameExternalMovieId;
			});

			setDuplicateListItems(
				duplicatedMovies.length > 0 ? duplicatedMovies : null,
			);
			setSameMovie(
				duplicatedMovies.find(
					(cachedMovie) => cachedMovie.url === extracted.url,
				) ?? null,
			);
		});
	};

	const handleCloseResult = useCallback(() => {
		setExtractedMovie(null);
	}, []);

	const handleRegisterContinue = useCallback(() => {
		setDuplicateListItems(null);
		setSameMovie(null);
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
						key="extracted-movie"
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
								<AnimatePresence mode="wait">
									{searchExistingMoviePending && (
										<motion.div
											key="search-existing-movie"
											className="px-4 pt-6"
										>
											...読み込み中
										</motion.div>
									)}

									{duplicateListItems && (
										<>
											<motion.div
												key="existing-item"
												initial={{ opacity: 0, y: 4 }}
												animate={{ opacity: 1, y: 0 }}
												exit={{ opacity: 0, y: -4 }}
												transition={{ duration: 0.2, ease: "easeOut" }}
											>
												<div className="pt-6 px-4">
													{sameMovie ? (
														<div className="py-2 text-center text-xl font-bold">
															すでにリスト登録されています。
															<ExistingListItemDetail movie={sameMovie} />
														</div>
													) : (
														<div className="py-2 flex flex-col items-center">
															<h2 className="text-xl font-bold pb-2 text-center">
																すでに以下の作品が登録済みです。
															</h2>
															<div className="w-full max-w-120 pt-4">
																<ul className="w-full pb-64">
																	{duplicateListItems.map((item) => (
																		<li
																			key={
																				item.listItemId ??
																				`${item.url}-${item.title}`
																			}
																			className="pb-4"
																		>
																			<ExistingListItemDetail movie={item} />
																		</li>
																	))}
																</ul>
															</div>
														</div>
													)}
												</div>
											</motion.div>
											{!sameMovie && (
												<SelectButtons
													onCancel={handleCloseResult}
													onContinue={handleRegisterContinue}
												/>
											)}
										</>
									)}

									{!duplicateListItems && (
										<motion.div
											key="extracted-movie"
											initial={{ opacity: 0, y: 4 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: -4 }}
											transition={{ duration: 0.2, ease: "easeOut" }}
										>
											<MovieCard listId={listId} movie={extractedMovie} />
										</motion.div>
									)}
								</AnimatePresence>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}
