"use server";

import type { Result } from "@/features/shared/types/Result";
import type { ListItem } from "@/features/list/types/ListItem";
import { getUserMovieList as getUserMovieListService } from "../services/listQueryService";

export async function getUserMovieList(
	listId: number,
): Promise<Result<ListItem[]>> {
	return await getUserMovieListService(listId);
}
