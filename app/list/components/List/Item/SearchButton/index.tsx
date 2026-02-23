"use client";

import type { ComponentProps } from "react";
import type { MovieInfo } from "@/app/types/MovieInputForm/MovieInfo";
import { useMovieAtom } from "@/app/list/state/useMovieAtom";
import { Button } from "@/components/ui/button";

type SearchButtonProps = ComponentProps<"button"> & {
	props?: ComponentProps<"button">;
	movie: MovieInfo;
};

export default function SearchButton({
	className,
	movie,
	children,
	...props
}: SearchButtonProps) {
	const { setMovie } = useMovieAtom();

	return (
		<Button
			{...props}
			className={className}
			onClick={() => {
				setMovie(movie);
			}}
		>
			{children ?? "ポスター画像をさがす"}
		</Button>
	);
}
