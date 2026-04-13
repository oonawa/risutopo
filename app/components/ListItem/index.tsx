import { useState } from "react";
import dynamic from "next/dynamic";
import type { DraftListItem, ListItem } from "@/features/list/types/ListItem";
import { useExternalMovieDatabase } from "@/features/movieDatabase/hooks/useExternalMovieDatabase";
import { useSubmitMovie } from "@/features/list/hooks/useSubmitMovie";
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

type Props = {
	mode?: Mode;
	movie: DraftListItem | ListItem;
	isLoggedIn?: boolean;
	refresh?: () => void;
};

export default function ListItemCard({
	mode,
	movie,
	isLoggedIn = false,
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

	const displayErrorMessage =
		submitNetworkError ?? removeNetworkError ?? errorMessage;
	const displaySuccess = displayErrorMessage !== undefined ? false : success;

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
		return (
			<EditingListItem
				movie={selectedMovie}
				isSearchPending={isSearchExternalMovieDatabasePending}
				isSubmitPending={isSubmitPending}
				isRemovePending={isRemovePending}
				handleSearch={handleSearchDetail}
				handleSubmit={handleSubmit}
				handleRemove={handleRemove}
				handleCancel={handleSelectCancel}
				storeSuccess={displaySuccess}
				errorMessage={displayErrorMessage}
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
					handleSelectCancel();
					setCurrentMode("searchDetail");
				}}
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
