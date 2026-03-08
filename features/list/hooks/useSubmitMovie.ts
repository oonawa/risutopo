import { useState, useTransition } from "react";
import type { ListItem } from "@/features/list/types/ListItem";
import { storeListItem } from "@/features/list/actions/storeListItem";
import { removeListItem } from "@/features/list/actions/removeListItem";

export const useSubmitMovie = ({ onSuccess }: { onSuccess?: () => void }) => {
	const [success, setSuccess] = useState<boolean | undefined>(undefined);
	const [errorMessage, setErrorMessage] = useState<string | undefined>(
		undefined,
	);
	const [isSubmitPending, startSubmitTransition] = useTransition();
	const [isRemovePending, startRemoveTransition] = useTransition();

	const submit = ({
		movie,
		publicListId,
	}: {
		movie: ListItem;
		publicListId: string | null;
	}) => {
		startSubmitTransition(async () => {
			if (!publicListId) {
				setSuccess(true);
				return;
			}

			const result = await storeListItem({
				publicListId,
				movie,
				now: new Date(),
				isWatched: movie.isWatched ?? false,
			});

			setSuccess(result.success);

			if (result.success) {
				return onSuccess?.();
			}

			setErrorMessage(result.error.message);
		});
	};

	const remove = ({
		publicListId,
		listItemId,
	}: {
		publicListId: string | null;
		listItemId: string;
	}) => {
		startRemoveTransition(async () => {
			if (!publicListId) {
				setSuccess(true);
				return;
			}
			const result = await removeListItem({ listItemId });
			setSuccess(result.success);

			if (result.success) {
				return onSuccess?.();
			}

			setErrorMessage(result.error.message);
		});
	};

	return {
		isSubmitPending,
		submit,
		isRemovePending,
		remove,
		success,
		errorMessage,
	};
};
