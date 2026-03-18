import type { Tx } from "@/db/client";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getUserByEmail(tx: Tx, email: string) {
	return await tx.query.usersTable.findFirst({
		where: eq(usersTable.email, email),
	});
}
