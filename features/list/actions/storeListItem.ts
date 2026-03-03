"use server";

import type { Result } from "@/features/shared/types/Result";
import type { MovieFormError } from "../types/ItemStoreError";
import type { ListItem } from "../types/ListItem";
import { storeListItem as storeListItemService } from "../services/listCommandService";

type Args = {
	listId: number;
	movie: ListItem;
	isWatched: boolean;
	now: Date;
};

export async function storeListItem({
	listId,
	movie,
	isWatched,
	now,
}: Args): Promise<Result<ListItem, MovieFormError>> {
	return await storeListItemService({
		listId,
		movie,
		isWatched,
		now,
	});
}
