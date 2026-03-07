"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useMovieAtom } from "@/features/list/state/useMovieAtom";
import type { ListItem } from "@/features/list/types/ListItem";
import { useExternalMovieDatabase } from "@/features/movieDatabase/hooks/useExternalMovieDatabase";
import { useListLocalStorageRepository } from "@/features/list/repositories/client/useListLocalStorageRepository";
import { useSubmitMovie } from "@/features/list/hooks/useSubmitMovie";
import MovieCardSearchResult from "./SearchResult";
import MovieCardDetail from "./Detail";

type Props = {
	movie: ListItem;
	publicListId: string | null;
	onSuccess?: () => void;
};

type CtaMode = "watch" | "register";
type ResultState = "idle" | "success" | "error";

export default function MovieCard({ movie, publicListId, onSuccess }: Props) {
	const { setMovie } = useMovieAtom();

	const { removeListItem, storeListItem } = useListLocalStorageRepository();

	const [isSameMovieDetails, setIsSameMovieDetails] = useState(false);

	const handledSuccessRef = useRef({
		submitSuccess: false,
		removeSuccess: false,
	});

	const {
		currentMovieInfo,
		searchResult,
		handleSearch,
		handleSelect,
		handleSearchCancel,
		handleSelectCnacel,
		normalizedTitle,
		isSearchExternalMovieDatabasePending,
		isFetchExternalMovieDatabasePending,
	} = useExternalMovieDatabase({ movie });

	const {
		submitResult,
		isSubmitPending,
		submit,
		removeResult,
		isRemovePending,
		remove,
	} = useSubmitMovie();

	const submitErrorMessage =
		submitResult && !submitResult.success
			? submitResult.error.message
			: undefined;

	const resultState: ResultState =
		submitResult?.success === true
			? "success"
			: submitResult?.success === false
				? "error"
				: "idle";
	const isSubmitSuccess = submitResult?.success === true;
	const isRemoveSuccess = removeResult?.success === true;

	useEffect(() => {
		if (isSubmitSuccess && !handledSuccessRef.current.submitSuccess) {
			handledSuccessRef.current.submitSuccess = true;
			onSuccess?.();
		}

		if (!isSubmitSuccess) {
			handledSuccessRef.current.submitSuccess = false;
		}

		if (isRemoveSuccess && !handledSuccessRef.current.removeSuccess) {
			handledSuccessRef.current.removeSuccess = true;
			onSuccess?.();
			setMovie(null);
		}

		if (!isRemoveSuccess) {
			handledSuccessRef.current.removeSuccess = false;
		}
	}, [isSubmitSuccess, isRemoveSuccess, onSuccess, setMovie]);

	const handleSearchSelect = (externalMovieId: number) => {
		setIsSameMovieDetails(false);

		handleSelect(externalMovieId);
	};

	const handleSubmit = () => {
		const newItem = currentMovieInfo ?? movie;
		storeListItem(newItem);
		submit({ movie: newItem, publicListId });
	};

	const handleRemove = () => {
		const listItemId = currentMovieInfo?.listItemId ?? movie.listItemId;
		if (listItemId) {
			removeListItem(listItemId);
			remove({
				publicListId,
				listItemId,
			});
		}
	};

	const selectedMovieId = currentMovieInfo?.details?.externalDatabaseMovieId;
	const defaultMovieId = movie.details?.externalDatabaseMovieId;
	const isSameMovie =
		selectedMovieId !== undefined &&
		defaultMovieId !== undefined &&
		selectedMovieId === defaultMovieId;

	const defaultDetailCtaMode: CtaMode =
		movie.listItemId || movie.details ? "watch" : "register";
	const selectedDetailCtaMode: CtaMode = "register";

	return (
		<div className="w-full flex justify-center">
			<div className="w-full pt-4 px-4">
				<AnimatePresence mode="wait" initial={false}>
					{searchResult && !currentMovieInfo && (
						<motion.div
							key="search-result"
							initial={{ opacity: 0, y: 4 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -4 }}
							transition={{ duration: 0.2, ease: "easeOut" }}
						>
							<MovieCardSearchResult
								onSearch={handleSearch}
								onSelect={handleSearchSelect}
								onCancel={handleSearchCancel}
								title={normalizedTitle}
								searchResult={searchResult}
								isSearchPending={isSearchExternalMovieDatabasePending}
								isGetMoviePending={isFetchExternalMovieDatabasePending}
							/>
						</motion.div>
					)}

					{!searchResult && !currentMovieInfo && (
						<motion.div
							key="default-detail"
							initial={{ opacity: 0, y: 4 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -4 }}
							transition={{ duration: 0.2, ease: "easeOut" }}
						>
							<MovieCardDetail
								ctaMode={defaultDetailCtaMode}
								isSearchPending={isSearchExternalMovieDatabasePending}
								isSubmitPending={isSubmitPending}
								isRemovePending={isRemovePending}
								onSearch={handleSearch}
								onSubmit={handleSubmit}
								onRemove={handleRemove}
								onCancel={handleSelectCnacel}
								movie={movie}
								resultState={resultState}
								submitErrorMessage={submitErrorMessage}
								isLoggedIn={publicListId !== null}
								isSameMovie={isSameMovie}
							/>
						</motion.div>
					)}

					{searchResult && currentMovieInfo && (
						<motion.div
							key="selected-detail"
							initial={{ opacity: 0, y: 4 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -4 }}
							transition={{ duration: 0.2, ease: "easeOut" }}
						>
							<MovieCardDetail
								ctaMode={selectedDetailCtaMode}
								isSearchPending={isSearchExternalMovieDatabasePending}
								isSubmitPending={isSubmitPending}
								isRemovePending={isRemovePending}
								onSearch={handleSearch}
								onSubmit={handleSubmit}
								onRemove={handleRemove}
								onCancel={handleSelectCnacel}
								movie={currentMovieInfo}
								resultState={resultState}
								submitErrorMessage={submitErrorMessage}
								isLoggedIn={publicListId !== null}
								isSameMovie={isSameMovie}
								isSameMovieDetails={isSameMovieDetails}
							/>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}
