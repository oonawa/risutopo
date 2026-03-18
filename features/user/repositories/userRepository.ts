import type { Tx } from "@/db/client";
import { userEmailsTable, usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getUserByEmail(tx: Tx, email: string) {
	const [user] = await tx
		.select({
			id: usersTable.id,
			publicId: usersTable.publicId,
			email: userEmailsTable.email,
		})
		.from(usersTable)
		.innerJoin(userEmailsTable, eq(userEmailsTable.userId, usersTable.id))
		.where(eq(userEmailsTable.email, email));

	return user ?? null;
}
