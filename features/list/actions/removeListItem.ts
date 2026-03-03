"use server";

import type { Result } from "@/features/shared/types/Result";
import { removeListItem as removeListItemService } from "../services/listCommandService";

type Args = {
	listItemId: string;
};

export async function removeListItem({ listItemId }: Args): Promise<Result> {
	return await removeListItemService({ listItemId });
}
