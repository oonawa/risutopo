import type { Tx } from "@/db/client";
import { db } from "@/db/client";
import {
	reauthTokensTable,
	loginCodesTable,
	sessionTokensTable,
	tempSessionTokensTable,
} from "@/db/schema";
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
		.from(loginCodesTable)
		.where(
			and(
				eq(loginCodesTable.token, loginCodeHash),
				gt(loginCodesTable.expiresAt, now),
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
		.delete(loginCodesTable)
		.where(eq(loginCodesTable.email, email));
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
	await tx.insert(loginCodesTable).values({
		token,
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
		.delete(sessionTokensTable)
		.where(
			and(
				eq(sessionTokensTable.userId, userId),
				eq(sessionTokensTable.deviceId, deviceId),
			),
		);
}

export async function deleteSessionTokenByToken({
	tx,
	sessionToken,
}: {
	tx?: Tx;
	sessionToken: string;
}) {
	const executor = tx || db;
	await executor
		.delete(sessionTokensTable)
		.where(eq(sessionTokensTable.token, sessionToken));
}

export async function insertSessionToken({
	tx,
	sessionToken,
	deviceId,
	userId,
	now,
	expiresAt,
}: {
	tx: Tx;
	sessionToken: string;
	deviceId: string;
	userId: number;
	now: Date;
	expiresAt: Date;
}) {
	await tx.insert(sessionTokensTable).values({
		token: sessionToken,
		deviceId,
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
	await tx.insert(tempSessionTokensTable).values({
		token: tempToken,
		deviceId,
		email,
		createdAt,
		expiresAt,
	});
}

export async function insertReauthToken({
	tx,
	token,
	userId,
	expiresAt,
	createdAt,
}: {
	tx: Tx;
	token: string;
	userId: number;
	expiresAt: Date;
	createdAt: Date;
}) {
	await tx.insert(reauthTokensTable).values({
		token,
		userId,
		expiresAt,
		createdAt,
	});
}

export async function searchReauthToken({
	tx,
	token,
	now,
}: {
	tx?: Tx;
	token: string;
	now: Date;
}) {
	const executor = tx || db;
	const [record] = await executor
		.select({ userId: reauthTokensTable.userId })
		.from(reauthTokensTable)
		.where(
			and(
				eq(reauthTokensTable.token, token),
				gt(reauthTokensTable.expiresAt, now),
			),
		);

	return record ?? null;
}

export async function deleteReauthToken({
	tx,
	token,
}: {
	tx?: Tx;
	token: string;
}) {
	const executor = tx || db;
	await executor.delete(reauthTokensTable).where(eq(reauthTokensTable.token, token));
}

