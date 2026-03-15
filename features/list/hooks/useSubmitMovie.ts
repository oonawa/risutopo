import { useState, useTransition } from "react";
import type { ListItem } from "@/features/list/types/ListItem";
import { storeListItem } from "@/features/list/actions/storeListItem";
import { removeListItem } from "@/features/list/actions/removeListItem";
import { useListLocalStorageRepository } from "../repositories/client/useListLocalStorageRepository";

export const useSubmitMovie = ({ onSuccess }: { onSuccess?: () => void }) => {
	const [success, setSuccess] = useState<boolean | undefined>(undefined);
	const [errorMessage, setErrorMessage] = useState<string | undefined>(
		undefined,
	);
	const [isSubmitPending, startSubmitTransition] = useTransition();
	const [isRemovePending, startRemoveTransition] = useTransition();

	const {
		storeListItem: storeLocalListItem,
		removeListItem: removeLocalListItem,
	} = useListLocalStorageRepository();

	const submit = ({
		movie,
		publicListId,
	}: {
		movie: ListItem;
		publicListId: string | null;
	}) => {
		startSubmitTransition(async () => {
			if (!publicListId) {
				storeLocalListItem(movie);
				setSuccess(true);
				return onSuccess?.();
			}

			const result = await storeListItem({
				publicListId,
				movie,
				now: new Date(),
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
				removeLocalListItem(listItemId);
				setSuccess(true);
				return onSuccess?.();
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
