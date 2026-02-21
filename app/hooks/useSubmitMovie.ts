import { useState, useTransition } from "react";
import type { MovieInfo } from "@/app/types/MovieInputForm/MovieInfo";
import type { Result } from "@/app/types/Result";
import { storeMovie } from "@/app/actions/storeMovie";
import { useLocalStorage } from "@/app/hooks/useMovieForm/useLocalStorage";

type SubmitActionResult = Result<MovieInfo | { recommendedLogin: true }>;

export const useSubmitMovie = () => {
	const { appendMovieToStorage } = useLocalStorage();

	const [result, setResult] = useState<SubmitActionResult | null>(null);
	const [isSubmitPending, startSubmitTransition] = useTransition();

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
				setResult({
					success: true,
					data: {
						recommendedLogin: true,
					},
				});
				return;
			}

			const storeMovieResult = await storeMovie({ listId, movie: movie });
			if (!storeMovieResult.success) {
				setResult({
					success: false,
					error: {
						message: storeMovieResult.error.message,
					},
				});
				return;
			}

			setResult(storeMovieResult);
		});
	};

	return {
		result,
		isSubmitPending,
		submit,
	};
};
