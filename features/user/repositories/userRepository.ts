import type { Tx } from "@/db/client";
import { deletedUsersTable, userEmailsTable, usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { computeHmac, decrypt } from "@/features/shared/lib/encryption";

export async function getUserByEmail(tx: Tx, email: string) {
	return getUserByEmailHmac(tx, computeHmac(email));
}

export async function getUserByEmailHmac(tx: Tx, emailHmac: string) {
	const [user] = await tx
		.select({
			id: usersTable.id,
			publicId: usersTable.publicId,
			email: userEmailsTable.email,
		})
		.from(usersTable)
		.innerJoin(userEmailsTable, eq(userEmailsTable.userId, usersTable.id))
		.where(eq(userEmailsTable.emailHmac, emailHmac));

	if (!user) return null;
	return {
		id: user.id,
		publicId: user.publicId,
		email: decrypt(user.email),
	};
}

export async function findUserById(tx: Tx, userId: number) {
	const [user] = await tx
		.select({
			id: usersTable.id,
			publicId: usersTable.publicId,
		})
		.from(usersTable)
		.where(eq(usersTable.id, userId));

	if (!user) return null;
	return {
		id: user.id,
		publicId: user.publicId,
	};
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

export async function insertUser({
	tx,
	publicId,
}: {
	tx: Tx;
	publicId: string;
}) {
	const [newUser] = await tx
		.insert(usersTable)
		.values({ publicId })
		.returning({ id: usersTable.id });

	return newUser;
}
