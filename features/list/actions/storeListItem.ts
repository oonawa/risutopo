"use server";

import z from "zod";
import type { Result } from "@/features/shared/types/Result";
import type { ListItem } from "../types/ListItem";
import { listItemSchema } from "@/features/shared/schemas/listItemSchema";
import { storeListItemService } from "../services/storeListItemService";

const storeListItemSchema = z.object({
	publicListId: z.uuid(),
	movie: listItemSchema,
	now: z.date(),
});

type Args = {
	publicListId: string;
	movie: ListItem;
	now: Date;
};

export async function storeListItem({
	publicListId,
	movie,
	now,
}: Args): Promise<Result<ListItem>> {
	const parsed = storeListItemSchema.safeParse({
		publicListId,
		movie,
		now,
	});

	if (!parsed.success) {
		console.error(parsed.error.message)
		return {
			success: false,
			error: {
				code: "VALIDATION_ERROR",
				message: "不正なリクエストです。",
			},
		};
	}

	return await storeListItemService({
		publicListId,
		movie,
		now,
	});
}
