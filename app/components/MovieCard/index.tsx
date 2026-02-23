"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { MovieInfo } from "@/app/types/MovieInputForm/MovieInfo";
import { useExternalMovieDatabase } from "@/app/hooks/useExternalMovieDatabase";
import { useSubmitMovie } from "@/app/hooks/useSubmitMovie";
import MovieCardSearchResult from "./SearchResult";
import MovieCardDetail from "./Detail";

type Props = {
	movie: MovieInfo;
	listId: number | null;
	onStoreSuccess?: () => void;
};

export default function MovieCard({ movie, listId, onStoreSuccess }: Props) {
	const {
		currentMovieInfo,
		searchResult,
		handleSearch,
		handleSelect,
		handleSearchCancel,
		handleSelectCnacel,
		normalizedTitle,
		isSearchPending,
		isGetMoviePending,
	} = useExternalMovieDatabase({ movie });

	const { result, isSubmitPending, submit } = useSubmitMovie();

	useEffect(() => {
		if (result?.success) {
			onStoreSuccess?.();
		}
	}, [result, onStoreSuccess]);

	const submitErrorMessage =
		result && !result.success ? result.error.message : undefined;

	const handleSubmit = () => {
		submit({ movie: currentMovieInfo ?? movie, listId });
	};

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
								isSearchPending={isSearchPending}
								isGetMoviePending={isGetMoviePending}
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
								isSearchPending={isSearchPending}
								isSubmitPending={isSubmitPending}
								onSearch={handleSearch}
								onSubmit={handleSubmit}
								movie={movie}
								submitResult={result?.success}
								submitErrorMessage={submitErrorMessage}
								isLoggedIn={listId !== null}
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
								isSearchPending={isSearchPending}
								isSubmitPending={isSubmitPending}
								onSearch={handleSearch}
								onSubmit={handleSubmit}
								onCancel={handleSelectCnacel}
								movie={currentMovieInfo}
								submitResult={result?.success}
								submitErrorMessage={submitErrorMessage}
								isLoggedIn={listId !== null}
							/>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}
