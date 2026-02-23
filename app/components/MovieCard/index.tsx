"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useMovieAtom } from "@/app/list/state/useMovieAtom";
import type { MovieInfo } from "@/app/types/MovieInputForm/MovieInfo";
import { useExternalMovieDatabase } from "@/app/hooks/useExternalMovieDatabase";
import { useSubmitMovie } from "@/app/hooks/useSubmitMovie";
import MovieCardSearchResult from "./SearchResult";
import MovieCardDetail from "./Detail";

type Props = {
	movie: MovieInfo;
	listId: number | null;
	onSuccess?: () => void;
};

type CtaMode = "watch" | "register";
type ResultState = "idle" | "success" | "error";

export default function MovieCard({ movie, listId, onSuccess }: Props) {
	const { setMovie } = useMovieAtom();

	const hasHandledSubmitSuccessRef = useRef(false);
	const hasHandledRemoveSuccessRef = useRef(false);

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

	const { submitResult, isSubmitPending, submit, removeResult, isRemovePending, remove } =
		useSubmitMovie();

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
		if (isSubmitSuccess && !hasHandledSubmitSuccessRef.current) {
			hasHandledSubmitSuccessRef.current = true;
			onSuccess?.();
		}

		if (!isSubmitSuccess) {
			hasHandledSubmitSuccessRef.current = false;
		}
	}, [isSubmitSuccess, onSuccess]);

	useEffect(() => {
		if (isRemoveSuccess && !hasHandledRemoveSuccessRef.current) {
			hasHandledRemoveSuccessRef.current = true;
			onSuccess?.();
			setMovie(null);
		}

		if (!isRemoveSuccess) {
			hasHandledRemoveSuccessRef.current = false;
		}
	}, [isRemoveSuccess, onSuccess, setMovie]);

	const handleSubmit = () => {
		submit({ movie: currentMovieInfo ?? movie, listId });
	};

	const handleRemove = () => {
		const listItemId = currentMovieInfo?.listItemId ?? movie.listItemId;
		if (listItemId) {
			remove({
				listId,
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
								onSelect={handleSelect}
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
								isLoggedIn={listId !== null}
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
								isLoggedIn={listId !== null}
								isSameMovie={isSameMovie}
							/>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}
