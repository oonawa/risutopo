import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { useDebounce } from "./useDebounce";
import { addMovie } from "@/app/actions/addMovie";
import type { MovieInputValues } from "@/app/types/MovieInputForm/MovieInputValues";

type Props = {
	listId: number | null;
	debounceMs: number;
};

type HandleValueChangeInput = {
	values: MovieInputValues;
};

export function useMovieForm({ listId, debounceMs }: Props) {
	const { storageErrorMessage, appendMovieToStorage } = useLocalStorage();

	const handleSubmit = useCallback(
		async (values: MovieInputValues) => {
			const result = await addMovie({
				listId,
				...values,
			});

			if (result.success) {
				appendMovieToStorage(result.data);
			}
			return result;
		},
		[listId, appendMovieToStorage],
	);

	const debouncedHandleSubmit = useDebounce({
		handleSubmit,
		delayMs: debounceMs,
	});

	const handleValueChange = useCallback(
		({ values }: HandleValueChangeInput) => {
			return debouncedHandleSubmit(values);
		},
		[debouncedHandleSubmit],
	);

	return { storageErrorMessage, handleValueChange };
}
