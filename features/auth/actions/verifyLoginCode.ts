"use server";

import { cookies, headers } from "next/headers";
import crypto from "node:crypto";
import { eq, and, gt } from "drizzle-orm";
import { db } from "@/db/client";
import type { Tx } from "@/db/client";
import type { Result } from "@/features/shared/types/Result";
import { authTokensTable, usersTable } from "@/db/schema";
import { loginCodeSchema } from "../schemas/loginSchemas";
import {
	generateSessionToken,
	generateTempSessionToken,
	addDays,
} from "../services/session";
import { checkRateLimit, recordAttempt } from "../services/rateLimit";
import { generateDeviceId } from "../services/devices";

export async function verifyLoginCode(
	loginCode: string,
	now: Date,
): Promise<
	Result<{
		email: string;
		isNewUser: boolean;
	}>
> {
	const result = validateLoginCode(loginCode);

	if (!result.success) {
		return {
			success: false,
			error: {
				code: "VALIDATION_ERROR",
				message: result.error.message,
			},
		};
	}

	const headersList = await headers();

	const { limit, ipAddress } = await checkRateLimit({
		ipAddress:
			headersList.get("x-forwarded-for")?.split(",")[0] ||
			headersList.get("x-real-ip") ||
			"unknown",
		attemptType: "code_verify",
	});

	if (!limit.allowed && limit.retryAfter) {
		const minutesUntilRetry = calcurateMinutesUntilRetry(
			limit.retryAfter.getTime(),
			now.getTime(),
		);

		return {
			success: false,
			error: {
				code: "VALIDATION_ERROR",
				message: `試行回数が上限に達しました。${minutesUntilRetry}分後に再度お試しください。`,
			},
		};
	}

	const deviceId = generateDeviceId(headersList.get("user-agent") || "Unknown");

	try {
		const txResult = await db.transaction(
			async (
				tx,
			): Promise<
				Result<{
					token: string;
					email: string;
					isNewUser: boolean;
					expiresAt: Date;
				}>
			> => {
				const founded = await searchLoginCode({
					tx,
					inputtedCode: loginCode,
					now,
				});

				if (!founded) {
					await recordAttempt({
						executor: tx,
						ipAddress,
						email: null,
						attemptType: "code_verify",
						success: false,
					});

					return {
						success: false,
						error: { code: "VALIDATION_ERROR", message: "ログインコードが不正です" },
					};
				}

				await recordAttempt({
					executor: tx,
					ipAddress,
					email: founded.email,
					attemptType: "code_verify",
					success: true,
				});

				await tx
					.delete(authTokensTable)
					.where(eq(authTokensTable.token, founded.token));

				const [user] = await tx
					.select()
					.from(usersTable)
					.where(eq(usersTable.email, founded.email));

				if (user) {
					const { sessionToken: newToken, expiresAt } =
						await updateSessionToken({
							tx,
							user,
							deviceId,
							now,
						});

					return {
						success: true,
						data: {
							token: newToken,
							email: user.email,
							isNewUser: false,
							expiresAt,
						},
					};
				}

				const tempToken = generateTempSessionToken();

				const expiresAt = addMinutes(now, 15);

				await insertTempToken({
					tx,
					tempToken,
					expiresAt,
					email: founded.email,
					deviceId,
					createdAt: now,
				});

				return {
					success: true,
					data: {
						token: tempToken,
						email: founded.email,
						isNewUser: true,
						expiresAt,
					},
				};
			},
		);

		if (!txResult.success) {
			return {
				success: false,
				error: txResult.error,
			};
		}

		const { email, isNewUser, token, expiresAt } = txResult.data;
		await setCookie({
			isNewUser: isNewUser,
			token,
			expiresAt,
		});

		return {
			data: {
				email,
				isNewUser,
			},
			success: true,
		};
	} catch (err) {
		console.error(err);
		return {
			success: false,
			error: {
				code: "INTERNAL_ERROR",
				message: "内部エラーが発生しました。",
			},
		};
	}
}

function validateLoginCode(loginCode: string) {
	return loginCodeSchema.safeParse({ value: loginCode });
}

async function searchLoginCode({
	tx,
	inputtedCode,
	now,
}: {
	tx: Tx;
	inputtedCode: string;
	now: Date;
}) {
	const [loginCode] = await tx
		.select()
		.from(authTokensTable)
		.where(
			and(
				eq(authTokensTable.token, hashLoginCode(inputtedCode)),
				eq(authTokensTable.tokenType, "login_code"),
				gt(authTokensTable.expiresAt, now),
			),
		);
	return loginCode;
}

async function updateSessionToken({
	tx,
	user,
	deviceId,
	now,
}: {
	tx: Tx;
	user: {
		id: number;
		publicId: string;
		email: string;
	};
	deviceId: string;
	now: Date;
}) {
	await tx
		.delete(authTokensTable)
		.where(
			and(
				eq(authTokensTable.tokenType, "session_token"),
				eq(authTokensTable.userId, user.id),
				eq(authTokensTable.deviceId, deviceId),
			),
		);

	const sessionToken = await generateSessionToken({
		userId: user.id,
		email: user.email,
		deviceId,
	});

	const expiresAt = addDays(now, 30);

	await tx.insert(authTokensTable).values({
		token: sessionToken,
		tokenType: "session_token",
		deviceId,
		email: user.email,
		userId: user.id,
		createdAt: now,
		expiresAt: expiresAt,
	});

	return { sessionToken, expiresAt };
}

async function insertTempToken({
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

function calcurateMinutesUntilRetry(
	retryAfterTime: number,
	currentTime: number,
) {
	return Math.ceil((retryAfterTime - currentTime) / 60000);
}

function hashLoginCode(code: string) {
	return crypto.createHash("sha256").update(code).digest("hex");
}

function addMinutes(date: Date, minutes: number) {
	return new Date(date.getTime() + minutes * 60 * 1000);
}

async function setCookie({
	isNewUser,
	token,
	expiresAt,
}: {
	isNewUser: boolean;
	token: string;
	expiresAt: Date;
}) {
	const cookieStore = await cookies();
	const key = isNewUser ? "temp_session_token" : "session_token";

	cookieStore.set(key, token, {
		httpOnly: true,
		secure: true,
		sameSite: "lax",
		expires: expiresAt,
	});
}
