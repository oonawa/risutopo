import { getUserMovieList } from "@/features/list/actions/getUserMovieList";
import { useListLocalStorageRepository } from "../repositories/client/useListLocalStorageRepository";

type Props = {
	publicListId: string | null;
};

export const useFetchExistingListItem = ({ publicListId }: Props) => {
	const { getListItems, replaceListItems, initializeEmptyList, getListId } =
		useListLocalStorageRepository();

	const fetchCurrentUserList = async (publicListId: string) => {
		const result = await getUserMovieList(publicListId);

		if (!result.success) {
			return [];
		}
		return result.data;
	};

	const hydrateLocalStorage = async () => {
		const hasLocalStorage = getListId().length !== 0;

		if (hasLocalStorage && getListItems().length) {
			return;
		}

		if (publicListId) {
			const existing = await fetchCurrentUserList(publicListId);
			return replaceListItems(existing, publicListId);
		}

		return initializeEmptyList();
	};

	return {
		hydrateLocalStorage,
	};
};
