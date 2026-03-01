"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { listItemsTable } from "@/db/schema";
import type { Result } from "@/app/types/Result";

type Args = {
	listItemId: string;
};

export async function removeListItem({ listItemId }: Args): Promise<Result> {
	try {
		const [listItem] = await db
			.select({ id: listItemsTable.id })
			.from(listItemsTable)
			.where(eq(listItemsTable.publicId, listItemId));

		if (!listItem) {
			return {
				success: false,
				error: { message: "作品がリストへ登録されていないか、すでに削除されています。" },
			};
		}

		await db
			.delete(listItemsTable)
			.where(eq(listItemsTable.publicId, listItemId));

		return { success: true };
	} catch (error) {
		console.error(error);

		return {
			success: false,
			error: { message: "映画の削除に失敗しました。" },
		};
	}
}
