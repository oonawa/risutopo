"use server";

import type { Result } from "@/features/shared/types/Result";
import type { MovieFormError } from "../types/ItemStoreError";
import type { ListItem } from "../types/ListItem";
import { storeListItem as storeListItemService } from "../services/listCommandService";

type Args = {
	publicListId: string;
	movie: ListItem;
	isWatched: boolean;
	now: Date;
};

export async function storeListItem({
	publicListId,
	movie,
	isWatched,
	now,
}: Args): Promise<Result<ListItem, MovieFormError>> {
	return await storeListItemService({
		publicListId,
		movie,
		isWatched,
		now,
	});
}
