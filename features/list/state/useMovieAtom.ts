import { atom, useAtom } from "jotai";
import type { ListItem } from "@/features/list/types/ListItem";

const movieAtom = atom<ListItem | null>(null);

export const useMovieAtom = () => {
	const [movie, setMovie] = useAtom(movieAtom);

	return {
		movie,
		setMovie,
	};
};
