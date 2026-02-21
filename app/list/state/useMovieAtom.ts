import { atom, useAtom } from "jotai";
import type { MovieInfo } from "@/app/types/MovieInputForm/MovieInfo";

const movieAtom = atom<MovieInfo | null>(null);

export const useMovieAtom = () => {
	const [movie, setMovie] = useAtom(movieAtom);

	return {
		movie,
		setMovie,
	};
};
