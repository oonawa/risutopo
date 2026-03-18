import type { Tx } from "@/db/client";
import { db } from "@/db/client";
import {
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
	await tx.insert(sessionTokensTable).values({
		token: sessionToken,
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
	await tx.insert(tempSessionTokensTable).values({
		token: tempToken,
		deviceId,
		email,
		createdAt,
		expiresAt,
	});
}
