"use server";

import z from "zod";
import type { Result } from "@/features/shared/types/Result";
import { findSubListIdByPublicId } from "../repositories/server/listRepository";
import { manageSubListItemService } from "../services/manageSubListItemService";

const removeSubListItemSchema = z.object({
	subListPublicId: z.uuid(),
	listItemPublicId: z.uuid(),
});

export async function removeSubListItem({
	subListPublicId,
	listItemPublicId,
}: {
	subListPublicId: string;
	listItemPublicId: string;
}): Promise<Result> {
	const parsed = removeSubListItemSchema.safeParse({
		subListPublicId,
		listItemPublicId,
	});

	if (!parsed.success) {
		return {
			success: false,
			error: {
				code: "VALIDATION_ERROR",
				message: "不正なリクエストです。",
			},
		};
	}

	const subListId = await findSubListIdByPublicId(parsed.data.subListPublicId);

	if (!subListId) {
		return {
			success: false,
			error: {
				code: "NOT_FOUND_ERROR",
				message: "サブリストが見つかりませんでした。",
			},
		};
	}

	return await manageSubListItemService({
		subListId,
		listItemPublicId: parsed.data.listItemPublicId,
		action: "remove",
	});
}
