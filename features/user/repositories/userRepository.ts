import type { Tx } from "@/db/client";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getUserByMail(tx: Tx, email: string) {
	const [user] = await tx
		.select()
		.from(usersTable)
		.where(eq(usersTable.email, email));

	return user;
}
