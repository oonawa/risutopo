import { db } from "@/db/client";
import type { Result } from "@/features/shared/types/Result";
import {
	deleteSubListItem,
	findIntListItemIdByPublicId,
	insertSubListItem,
} from "../repositories/server/listRepository";

export const manageSubListItemService = async ({
	subListId,
	listItemPublicId,
	action,
}: {
	subListId: number;
	listItemPublicId: string;
	action: "add" | "remove";
}): Promise<Result> => {
	const listItemId = await findIntListItemIdByPublicId(listItemPublicId);

	if (listItemId === null) {
		return {
			success: false,
			error: {
				code: "NOT_FOUND_ERROR",
				message: "リストアイテムが見つかりませんでした。",
			},
		};
	}

	if (action === "add") {
		await db.transaction(async (tx) => {
			await insertSubListItem(tx, { subListId, listItemId });
		});
	} else {
		await deleteSubListItem(subListId, listItemId);
	}

	return { success: true };
};
