import { eq } from "drizzle-orm";
import type { Tx } from "@/db/client";
import { db } from "@/db/client";
import { userEmailsTable } from "@/db/schema";

export async function checkEmailExists(email: string): Promise<boolean> {
	const [record] = await db
		.select({ id: userEmailsTable.id })
		.from(userEmailsTable)
		.where(eq(userEmailsTable.email, email));
	return record !== undefined;
}

export async function replaceUserEmail({
	tx,
	userId,
	email,
}: {
	tx: Tx;
	userId: number;
	email: string;
}): Promise<void> {
	await tx.delete(userEmailsTable).where(eq(userEmailsTable.userId, userId));
	await tx.insert(userEmailsTable).values({ userId, email });
}
