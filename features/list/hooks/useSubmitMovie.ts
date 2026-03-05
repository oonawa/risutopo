import { useState, useTransition } from "react";
import type { ListItem } from "@/features/list/types/ListItem";
import type { Result } from "@/features/shared/types/Result";
import { storeListItem } from "@/features/list/actions/storeListItem";
import { removeListItem } from "@/features/list/actions/removeListItem";

type SubmitActionResult = Result<ListItem | { recommendedLogin: true }>;

export const useSubmitMovie = () => {
	const [submitResult, setSubmitResult] = useState<SubmitActionResult | null>(
		null,
	);
	const [removeResult, setRemoveResult] = useState<Result | null>(null);
	const [isSubmitPending, startSubmitTransition] = useTransition();
	const [isRemovePending, startRemoveTransition] = useTransition();

	const submit = ({
		movie,
		listPublicId,
	}: {
		movie: ListItem;
		listPublicId: string | null;
	}) => {
		startSubmitTransition(async () => {
			if (!listPublicId) {
				setSubmitResult({
					success: true,
					data: {
						recommendedLogin: true,
					},
				});
				return;
			}

			const storeListItemResult = await storeListItem({
				listPublicId,
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
		listPublicId,
		listItemId,
	}: {
		listPublicId: string | null;
		listItemId: string;
	}) => {
		startRemoveTransition(async () => {
			if (!listPublicId) {
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
