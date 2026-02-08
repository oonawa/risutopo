"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { listsTable } from "@/db/schema";

export async function getUserList(userId: number): Promise<number | null> {
	const [list] = await db
		.select({ id: listsTable.id })
		.from(listsTable)
		.where(eq(listsTable.userId, userId));

	return list?.id ?? null;
}
