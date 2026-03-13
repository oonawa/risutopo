import type { Tx } from "@/db/client";
import { db } from "@/db/client";
import { authTokensTable, usersTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function refreshLoginCode({
	email,
	token,
	expiresAt,
	createdAt,
}: {
	email: string;
	token: string;
	expiresAt: Date;
	createdAt: Date;
}) {
	await db.transaction(async (tx) => {
		await deleteLoginCode({ tx, email });
		await insertLoginCode({ tx, email, token, expiresAt, createdAt });
	});
}

export async function deleteLoginCode({ tx, email }: { tx?: Tx; email: string }) {
	const executor = tx || db;
	await executor
		.delete(authTokensTable)
		.where(
			and(
				eq(authTokensTable.email, email),
				eq(authTokensTable.tokenType, "login_code"),
			),
		);
}

async function insertLoginCode({
	tx,
	email,
	token,
	expiresAt,
	createdAt,
}: {
	tx: Tx;
	email: string;
	token: string;
	expiresAt: Date;
	createdAt: Date;
}) {
	const [user] = await tx
		.select()
		.from(usersTable)
		.where(eq(usersTable.email, email));

	await tx.insert(authTokensTable).values({
		token,
		tokenType: "login_code",
		email,
		userId: user?.id ?? null,
		expiresAt,
		createdAt,
	});
}
