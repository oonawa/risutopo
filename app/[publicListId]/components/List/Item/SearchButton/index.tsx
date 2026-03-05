"use client";

import type { ComponentProps } from "react";
import type { ListItem } from "@/features/list/types/ListItem";
import { useMovieAtom } from "@/features/list/state/useMovieAtom";
import { Button } from "@/components/ui/button";

type SearchButtonProps = ComponentProps<"button"> & {
	movie: ListItem;
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
			className={className}
			type="button"
			onClick={() => {
				setMovie(movie);
			}}
			{...props}
		>
			{children ?? "ポスター画像をさがす"}
		</Button>
	);
}
