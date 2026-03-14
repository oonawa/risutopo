import type { Tx } from "@/db/client";
import { db } from "@/db/client";
import { authTokensTable } from "@/db/schema";
import { and, eq, gt } from "drizzle-orm";

export async function searchLoginCode({
	tx,
	loginCodeHash,
	now,
}: {
	tx: Tx;
	loginCodeHash: string;
	now: Date;
}) {
	const [loginCode] = await tx
		.select()
		.from(authTokensTable)
		.where(
			and(
				eq(authTokensTable.token, loginCodeHash),
				eq(authTokensTable.tokenType, "login_code"),
				gt(authTokensTable.expiresAt, now),
			),
		);

	return loginCode;
}

export async function deleteLoginCode({
	tx,
	email,
}: {
	tx?: Tx;
	email: string;
}) {
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

export async function insertLoginCode({
	tx,
	userId,
	email,
	token,
	expiresAt,
	createdAt,
}: {
	tx: Tx;
	userId?: number;
	email: string;
	token: string;
	expiresAt: Date;
	createdAt: Date;
}) {
	await tx.insert(authTokensTable).values({
		token,
		tokenType: "login_code",
		email,
		userId: userId ?? null,
		expiresAt,
		createdAt,
	});
}

export async function deleteSessionToken({
	tx,
	userId,
	deviceId,
}: {
	tx: Tx;
	userId: number;
	deviceId: string;
}) {
	await tx
		.delete(authTokensTable)
		.where(
			and(
				eq(authTokensTable.tokenType, "session_token"),
				eq(authTokensTable.userId, userId),
				eq(authTokensTable.deviceId, deviceId),
			),
		);
}

export async function insertSessionToken({
	tx,
	sessionToken,
	deviceId,
	email,
	userId,
	now,
	expiresAt,
}: {
	tx: Tx;
	sessionToken: string;
	deviceId: string;
	email: string;
	userId: number;
	now: Date;
	expiresAt: Date;
}) {
	await tx.insert(authTokensTable).values({
		token: sessionToken,
		tokenType: "session_token",
		deviceId,
		email,
		userId,
		createdAt: now,
		expiresAt,
	});
}

export async function insertTempToken({
	tx,
	tempToken,
	expiresAt,
	email,
	deviceId,
	createdAt,
}: {
	tx: Tx;
	tempToken: string;
	expiresAt: Date;
	email: string;
	deviceId: string;
	createdAt: Date;
}) {
	await tx.insert(authTokensTable).values({
		token: tempToken,
		tokenType: "temp_session_token",
		deviceId,
		email,
		userId: null,
		createdAt,
		expiresAt,
	});
}
