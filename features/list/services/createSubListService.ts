import { db } from "@/db/client";
import type { Result } from "@/features/shared/types/Result";
import { insertSubList } from "../repositories/server/listRepository";

export const createSubListService = async ({
	listId,
	name,
}: {
	listId: number;
	name: string;
}): Promise<Result<{ publicId: string }>> => {
	const publicId = crypto.randomUUID();

	await db.transaction(async (tx) => {
		await insertSubList(tx, { listId, publicId, name });
	});

	return {
		success: true,
		data: { publicId },
	};
};
