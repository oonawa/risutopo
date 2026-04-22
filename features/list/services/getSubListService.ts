import type { Result } from "@/features/shared/types/Result";
import type { ListItem } from "@/features/list/types/ListItem";
import {
	findSubListItemsBySubListId,
	findMovieDirectorNames,
} from "../repositories/server/listRepository";
import {
	buildMovieDirectorMap,
	mapListItemRow,
} from "../helpers/listItemMappers";

export const getSubListService = async (
	subListId: number,
	_userId: number,
): Promise<Result<ListItem[]>> => {
	const rows = await findSubListItemsBySubListId(subListId);

	const movieIds = rows
		.map((row) => row.movieId)
		.filter((id) => id !== null);

	const directors = await findMovieDirectorNames(movieIds);
	const items: ListItem[] = rows.map((row) =>
		mapListItemRow(row, buildMovieDirectorMap(directors)),
	);

	return {
		success: true,
		data: items,
	};
};
