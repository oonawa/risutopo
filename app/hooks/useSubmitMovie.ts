import { useState, useTransition } from "react";
import type { MovieInfo } from "@/app/types/MovieInputForm/MovieInfo";
import type { Result } from "@/app/types/Result";
import { storeListItem } from "@/app/actions/storeListItem";
import { removeListItem } from "../actions/removeListItem";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";

type SubmitActionResult = Result<MovieInfo | { recommendedLogin: true }>;

export const useSubmitMovie = () => {
	const { appendMovieToStorage } = useLocalStorage();

	const [submitResult, setSubmitResult] = useState<SubmitActionResult | null>(
		null,
	);
	const [removeResult, setRemoveResult] = useState<Result | null>(null);
	const [isSubmitPending, startSubmitTransition] = useTransition();
	const [isRemovePending, startRemoveTransition] = useTransition();

	const submit = ({
		movie,
		listId,
	}: {
		movie: MovieInfo;
		listId: number | null;
	}) => {
		startSubmitTransition(async () => {
			appendMovieToStorage(movie);

			if (!listId) {
				setSubmitResult({
					success: true,
					data: {
						recommendedLogin: true,
					},
				});
				return;
			}

			const storeListItemResult = await storeListItem({
				listId,
				movie,
				now: new Date(),
				isWatched: movie.isWatched ?? false,
			});

			if (!storeListItemResult.success) {
				setSubmitResult({
					success: false,
					error: {
						message: storeListItemResult.error.message,
					},
				});
				return;
			}

			setSubmitResult(storeListItemResult);
		});
	};

	const remove = ({
		listId,
		listItemId,
	}: {
		listId: number | null;
		listItemId: string;
	}) => {
		startRemoveTransition(async () => {
			if (!listId) {
				setRemoveResult({
					success: true,
				});
				return;
			}
			const removeListItemResult = await removeListItem({ listItemId });
			setRemoveResult(removeListItemResult);
		});
	};

	return {
		isSubmitPending,
		submit,
		submitResult,
		isRemovePending,
		remove,
		removeResult,
	};
};
