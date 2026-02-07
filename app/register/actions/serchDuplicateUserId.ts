"use server";

import { db } from "@/db/client";
import { eq } from "drizzle-orm";
import { usersTable } from "@/db/schema";
import { userIdSchema } from "../userIdSchema";

export async function searchDeplicateUserId(userId: string) {
	const { error, data } = userIdSchema.safeParse({ userId });
	if (error) {
		return 0;
	}
	const results = await db
		.select()
		.from(usersTable)
		.where(eq(usersTable.publicId, data.userId));

	return results.length;
}
