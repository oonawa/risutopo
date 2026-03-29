import type { Tx } from "@/db/client";
import { deletedUsersTable, userEmailsTable, usersTable } from "@/db/schema";
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

export async function findUserById(tx: Tx, userId: number) {
	const [user] = await tx
		.select({
			id: usersTable.id,
			publicId: usersTable.publicId,
		})
		.from(usersTable)
		.where(eq(usersTable.id, userId));

	return user ?? null;
}

export async function insertDeletedUser({
	tx,
	publicId,
	deletedAt,
}: {
	tx: Tx;
	publicId: string;
	deletedAt: Date;
}) {
	await tx.insert(deletedUsersTable).values({
		publicId,
		deletedAt,
	});
}

export async function deleteUserById({
	tx,
	userId,
}: {
	tx: Tx;
	userId: number;
}) {
	await tx.delete(usersTable).where(eq(usersTable.id, userId));
}
