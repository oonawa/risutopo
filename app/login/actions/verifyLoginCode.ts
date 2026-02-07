"use server";

import type { Result } from "@/app/types/Result";
import { cookies, headers } from "next/headers";
import crypto from "crypto";
import { eq, and, gt } from "drizzle-orm";
import { db } from "@/db/client";
import { authTokensTable, usersTable } from "@/db/schema";
import { loginCodeSchema } from "../loginSchemas";
import { generateSessionToken, generateTempSessionToken } from "@/lib/auth";
import { addDays } from "@/lib/auth";
import { checkRateLimit, recordAttempt } from "@/lib/rateLimit";
import { generateDeviceId } from "@/lib/devices";

export async function verifyLoginCode(loginCode: string): Promise<
	Result<{
		email: string;
		needsRegistration: boolean;
	}>
> {
	const result = validateLoginCode(loginCode);

	if (!result.success) {
		return {
			success: false,
			error: { message: "ログインコードが不正です" },
		};
	}

	const headersList = await headers();
	const ipAddress =
		headersList.get("x-forwarded-for")?.split(",")[0] ||
		headersList.get("x-real-ip") ||
		"unknown";
	const userAgent = headersList.get("user-agent") || "Unknown";
	const deviceId = generateDeviceId(userAgent);

	const rateLimit = await checkRateLimit(ipAddress, "code_verify");

	if (!rateLimit.allowed && rateLimit.retryAfter) {
		const minutesUntilRetry = Math.ceil(
			(rateLimit.retryAfter.getTime() - Date.now()) / 60000,
		);

		return {
			success: false,
			error: {
				message: `試行回数が上限に達しました。${minutesUntilRetry}分後に再度お試しください。`,
			},
		};
	}

	const now = new Date();

	try {
		const result = await db.transaction(async (tx) => {
			const [token] = await tx
				.select()
				.from(authTokensTable)
				.where(
					and(
						eq(authTokensTable.token, hashLoginCode(loginCode)),
						eq(authTokensTable.tokenType, "login_code"),
						gt(authTokensTable.expiresAt, now),
					),
				);

			if (!token) {
				await recordAttempt({
					executor: tx,
					ipAddress,
					email: null,
					attemptType: "code_verify",
					success: false,
				});

				return {
					success: false,
					error: { message: "ログインコードが不正です" },
				};
			}

			await recordAttempt({
				executor: tx,
				ipAddress,
				email: token.email,
				attemptType: "code_verify",
				success: true,
			});

			await tx
				.delete(authTokensTable)
				.where(eq(authTokensTable.token, token.token));

			const [user] = await tx
				.select()
				.from(usersTable)
				.where(eq(usersTable.email, token.email));

			if (user) {
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

				return {
					success: true,
					token: sessionToken,
					user,
					needsRegistration: false,
					expiresAt,
				};
			}

			const tempToken = generateTempSessionToken();
			const expiresAt = addMinutes(now, 15);

			await tx.insert(authTokensTable).values({
				token: tempToken,
				tokenType: "temp_session_token",
				deviceId,
				email: token.email,
				userId: null,
				createdAt: now,
				expiresAt,
			});

			return {
				success: true,
				token: tempToken,
				user: { id: null, email: token.email },
				needsRegistration: true,
				expiresAt,
			};
		});

		const cookieStore = await cookies();

		if (result.token && result.success) {
			if (result.needsRegistration) {
				cookieStore.set("temp_session_token", result.token, {
					httpOnly: true,
					secure: true,
					sameSite: "lax",
					expires: result.expiresAt,
				});
			} else {
				cookieStore.set("session_token", result.token, {
					httpOnly: true,
					secure: true,
					sameSite: "lax",
					expires: result.expiresAt,
				});
			}

			return {
				data: {
					email: result.user.email,
					needsRegistration: result.needsRegistration,
				},
				success: true,
			};
		}

		return {
			success: false,
			error: { message: "ログインに失敗しました。もう一度お試しください。" },
		};
	} catch (err) {
		console.error(err);
		return {
			success: false,
			error: { message: "ログインの処理に不具合があります。" },
		};
	}
}

function validateLoginCode(loginCode: string) {
	return loginCodeSchema.safeParse({ value: loginCode });
}

function hashLoginCode(code: string) {
	return crypto.createHash("sha256").update(code).digest("hex");
}

function addMinutes(date: Date, minutes: number) {
	return new Date(date.getTime() + minutes * 60 * 1000);
}
