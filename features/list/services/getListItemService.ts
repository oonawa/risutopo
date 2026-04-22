import type { Result } from "@/features/shared/types/Result";
import type { ListItem } from "@/features/list/types/ListItem";
import {
	findListItemRowByPublicId,
	findMovieDirectorNames,
} from "../repositories/server/listRepository";
import {
	buildMovieDirectorMap,
	mapListItemRow,
} from "../helpers/listItemMappers";

export const getListItemService = async (
	listItemPublicId: string,
	userId: number,
): Promise<Result<ListItem>> => {
	const row = await findListItemRowByPublicId(listItemPublicId, userId);

	if (!row) {
		return {
			success: false,
			error: {
				code: "NOT_FOUND_ERROR",
				message: "アイテムが見つかりませんでした。",
			},
		};
	}

	const directors = row.movieId
		? await findMovieDirectorNames([row.movieId])
		: [];

	return {
		success: true,
		data: mapListItemRow(row, buildMovieDirectorMap(directors)),
	};
};
