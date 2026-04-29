"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { DraftListItem, ListItem } from "@/features/list/types/ListItem";
import { useExternalMovieDatabase } from "@/features/movieDatabase/hooks/useExternalMovieDatabase";
import { useSubmitMovie } from "@/features/list/hooks/useSubmitMovie";
import { useToggleWatchStatus } from "@/features/list/hooks/useToggleWatchStatus";
import NewListItem from "./New";
import { useMovieAtom } from "@/features/list/state/useMovieAtom";

const PreviewListItem = dynamic(() => import("./Preview"), { ssr: false });
const EditingListItem = dynamic(() => import("./Editing"), { ssr: false });
const WatchListItem = dynamic(() => import("./Watch"), { ssr: false });
const DrawnListItem = dynamic(() => import("./Drawn"), { ssr: false });
const SearchResult = dynamic(() => import("../SearchResult"), { ssr: false });

type Mode =
	| "extracted"
	| "edit"
	| "drawing"
	| "preview"
	| "searchDetail"
	| "storeSuccess"
	| "storeFailed";

type SubList = {
	publicId: string;
	name: string;
};

type Props = {
	mode?: Mode;
	movie: DraftListItem | ListItem;
	isLoggedIn?: boolean;
	publicListId?: string;
	refresh?: () => void;
	subLists?: SubList[];
	checkedSubListIds?: string[];
};

export default function ListItemCard({
	mode,
	movie,
	isLoggedIn = false,
	publicListId = "",
	refresh,
	subLists,
	checkedSubListIds,
}: Props) {
	const [currentMode, setCurrentMode] = useState<Mode | undefined>(undefined);

	const { setMovie } = useMovieAtom();

	const hasListItemId = (item: DraftListItem | ListItem): item is ListItem => {
		return "listItemId" in item;
	};

	const {
		selectedMovie,
		searchResult,
		normalizedTitle,
		handleSearch,
		handleSelect,
		handleSearchCancel,
		handleSelectCancel,
		isSearchExternalMovieDatabasePending,
		isFetchExternalMovieDatabasePending,
	} = useExternalMovieDatabase({ movie });

	const {
		isSubmitPending,
		submit,
		isRemovePending,
		remove,
		success,
		errorMessage,
		submitNetworkError,
		removeNetworkError,
	} = useSubmitMovie({
		onSuccess: refresh,
	});

	const {
		toggle: handleToggleWatch,
		isPending: isTogglePending,
		optimisticIsWatched,
		networkError: toggleNetworkError,
	} = useToggleWatchStatus({
		onSuccess: refresh,
		initialIsWatched: hasListItemId(movie) ? movie.isWatched : false,
	});

	const displayErrorMessage =
		submitNetworkError ?? removeNetworkError ?? toggleNetworkError ?? errorMessage;
	const displaySuccess = displayErrorMessage !== undefined ? false : success;

	const handleSubmit = () => {
		const newItem = selectedMovie ?? movie;

		const itemToStore = hasListItemId(newItem)
			? newItem
			: {
					...newItem,
					listItemId: window.crypto.randomUUID(),
				};

		submit({ movie: itemToStore });
	};

	const handleSubmitAsWatched = () => {
		const newItem = selectedMovie ?? movie;

		const itemToStore = hasListItemId(newItem)
			? { ...newItem, isWatched: true as const, watchedAt: new Date() }
			: {
					...newItem,
					listItemId: window.crypto.randomUUID(),
					isWatched: true as const,
					watchedAt: new Date(),
				};

		submit({ movie: itemToStore });
	};

	const handleSelectResult = (externalMovieId: number) => {
		handleSelect(externalMovieId);

		if (hasListItemId(movie)) {
			setCurrentMode("edit");
		} else {
			setCurrentMode("preview");
		}
	};

	const handleSearchDetail = (page?: number) => {
		handleSearch(page);
		setCurrentMode("searchDetail");
	};

	const handleRemove = () => {
		const targetMovie = selectedMovie ?? movie;
		if (!hasListItemId(targetMovie)) {
			return;
		}

		const { listItemId } = targetMovie;

		remove({
			listItemId,
		});

		setMovie(null);
	};

	if (currentMode === "edit") {
		const editingMovie = selectedMovie;
		const editingHandleToggleWatch =
			editingMovie && hasListItemId(editingMovie)
				? () => {
						handleToggleWatch({
							listItemId: editingMovie.listItemId,
							currentIsWatched: editingMovie.isWatched,
							currentListItem: editingMovie,
						});
					}
				: undefined;

		return (
			<EditingListItem
				movie={editingMovie}
				isSearchPending={isSearchExternalMovieDatabasePending}
				isSubmitPending={isSubmitPending}
				isRemovePending={isRemovePending}
				handleSearch={handleSearchDetail}
				handleSubmit={handleSubmit}
				handleRemove={handleRemove}
				handleCancel={handleSelectCancel}
				handleToggleWatch={editingHandleToggleWatch}
				isTogglePending={isTogglePending}
				storeSuccess={displaySuccess}
				errorMessage={displayErrorMessage}
				isLoggedIn={isLoggedIn}
			/>
		);
	}

	if (currentMode === "preview") {
		const previewMovie = selectedMovie;
		const previewHandleToggleWatch =
			previewMovie && hasListItemId(previewMovie)
				? () => {
						handleToggleWatch({
							listItemId: previewMovie.listItemId,
							currentIsWatched: previewMovie.isWatched,
							currentListItem: previewMovie,
						});
					}
				: undefined;

		return (
			<PreviewListItem
				movie={previewMovie}
				isSearchPending={isSearchExternalMovieDatabasePending}
				isSubmitPending={isSubmitPending}
				handleSearch={handleSearch}
				handleSubmit={handleSubmit}
				handleCancel={() => {
					handleSelectCancel();
					setCurrentMode("searchDetail");
				}}
				handleToggleWatch={previewHandleToggleWatch}
				isTogglePending={isTogglePending}
				storeSuccess={displaySuccess}
				errorMessage={displayErrorMessage}
				isLoggedIn={isLoggedIn}
			/>
		);
	}

	if (currentMode === "searchDetail") {
		return (
			<SearchResult
				searchResult={searchResult}
				title={normalizedTitle}
				onSearch={handleSearch}
				onSelect={handleSelectResult}
				onCancel={() => {
					handleSearchCancel();
					setCurrentMode(mode);
				}}
				isSearchPending={isSearchExternalMovieDatabasePending}
				isGetMoviePending={isFetchExternalMovieDatabasePending}
			/>
		);
	}

	if (mode === "extracted") {
		return (
			<NewListItem
				movie={movie}
				isSearchPending={isSearchExternalMovieDatabasePending}
				isSubmitPending={isSubmitPending}
				handleSearch={handleSearchDetail}
				handleSubmit={handleSubmit}
				onWatchToggle={handleSubmitAsWatched}
				isWatchTogglePending={isSubmitPending}
				storeSuccess={displaySuccess}
				errorMessage={displayErrorMessage}
				isLoggedIn={isLoggedIn}
			/>
		);
	}

	if (mode === "drawing") {
		if (!hasListItemId(movie)) {
			return <div></div>;
		}

		return <DrawnListItem movie={movie} />;
	}

	if (isLoggedIn) {
		return (
			<WatchListItem
				movie={movie}
				handleSearch={handleSearchDetail}
				handleRemove={handleRemove}
				isRemovePending={isRemovePending}
				isSearchPending={isSearchExternalMovieDatabasePending}
				isTogglePending={isTogglePending}
				optimisticIsWatched={optimisticIsWatched}
				publicListId={publicListId}
				isLoggedIn={true}
				subLists={subLists ?? []}
				checkedSubListIds={checkedSubListIds ?? []}
				handleToggleWatch={
					hasListItemId(movie)
						? () => {
								handleToggleWatch({
									listItemId: movie.listItemId,
									currentIsWatched: optimisticIsWatched,
									currentListItem: movie,
								});
							}
						: undefined
				}
			/>
		);
	}

	return (
		<WatchListItem
			movie={movie}
			handleSearch={handleSearchDetail}
			handleRemove={handleRemove}
			isRemovePending={isRemovePending}
			isSearchPending={isSearchExternalMovieDatabasePending}
			isTogglePending={isTogglePending}
			optimisticIsWatched={optimisticIsWatched}
			publicListId={publicListId}
			isLoggedIn={false}
			handleToggleWatch={
				hasListItemId(movie)
					? () => {
							handleToggleWatch({
								listItemId: movie.listItemId,
								currentIsWatched: optimisticIsWatched,
								currentListItem: movie,
							});
						}
					: undefined
			}
		/>
	);
}
