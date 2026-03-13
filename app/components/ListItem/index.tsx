import { useState } from "react";
import type { DraftListItem, ListItem } from "@/features/list/types/ListItem";
import { useExternalMovieDatabase } from "@/features/movieDatabase/hooks/useExternalMovieDatabase";
import { useSubmitMovie } from "@/features/list/hooks/useSubmitMovie";
import { useListLocalStorageRepository } from "@/features/list/repositories/client/useListLocalStorageRepository";
import NewListItem from "./New";
import PreviewListItem from "./Preview";
import EditingListItem from "./Editing";
import WatchListItem from "./Watch";
import DrawnListItem from "./Drawn";
import SearchResult from "../SearchResult";
import { useMovieAtom } from "@/features/list/state/useMovieAtom";

type Mode =
	| "extracted"
	| "edit"
	| "drawing"
	| "preview"
	| "searchDetail"
	| "storeSuccess"
	| "storeFailed";

type Props = {
	mode?: Mode;
	movie: DraftListItem | ListItem;
	publicListId: string | null;
	refresh?: () => void;
};

export default function ListItemCard({
	mode,
	movie,
	publicListId,
	refresh,
}: Props) {
	const [currentMode, setCurrentMode] = useState<Mode | undefined>(undefined);

	const { setMovie } = useMovieAtom();

	const {
		selectedMovie,
		searchResult,
		normalizedTitle,
		handleSearch,
		handleSelect,
		handleSearchCancel,
		handleSelectCnacel,
		isSearchExternalMovieDatabasePending,
		isFetchExternalMovieDatabasePending,
	} = useExternalMovieDatabase({ movie });

	const { storeListItem, removeListItem } = useListLocalStorageRepository();

	const {
		isSubmitPending,
		submit,
		isRemovePending,
		remove,
		success,
		errorMessage,
	} = useSubmitMovie({
		onSuccess: refresh,
	});

	const isLoggedIn = publicListId !== null;

	const hasListItemId = (item: DraftListItem | ListItem): item is ListItem => {
		return "listItemId" in item;
	};

	const handleSubmit = () => {
		const newItem = selectedMovie ?? movie;
		const itemToStore = hasListItemId(newItem)
			? newItem
			: {
					...newItem,
					listItemId: window.crypto.randomUUID(),
					isWatched: false
				};

		storeListItem(itemToStore);
		submit({ movie: itemToStore, publicListId });
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

		removeListItem(listItemId);
		remove({
			publicListId,
			listItemId,
		});

		setMovie(null);
	};

	if (currentMode === "edit") {
		return (
			<EditingListItem
				movie={selectedMovie}
				isSearchPending={isSearchExternalMovieDatabasePending}
				isSubmitPending={isSubmitPending}
				isRemovePending={isRemovePending}
				handleSearch={handleSearchDetail}
				handleSubmit={handleSubmit}
				handleRemove={handleRemove}
				handleCancel={handleSelectCnacel}
				storeSuccess={success}
				errorMessage={errorMessage}
				isLoggedIn={isLoggedIn}
			/>
		);
	}

	if (currentMode === "preview") {
		return (
			<PreviewListItem
				movie={selectedMovie}
				isSearchPending={isSearchExternalMovieDatabasePending}
				isSubmitPending={isSubmitPending}
				handleSearch={handleSearch}
				handleSubmit={handleSubmit}
				handleCancel={() => {
					handleSelectCnacel();
					setCurrentMode("searchDetail");
				}}
				storeSuccess={success}
				errorMessage={errorMessage}
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
				storeSuccess={success}
				errorMessage={errorMessage}
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

	return (
		<WatchListItem
			movie={movie}
			handleSearch={handleSearchDetail}
			handleRemove={handleRemove}
			isRemovePending={isRemovePending}
			isSearchPending={isSearchExternalMovieDatabasePending}
		/>
	);
}
