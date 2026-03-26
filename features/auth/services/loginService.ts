import { SignJWT } from "jose";
import crypto from "node:crypto";
import { db } from "@/db/client";
import type { Tx } from "@/db/client";
import { getSecretKey } from "@/lib/jwt";
import type { Result } from "@/features/shared/types/Result";
import { insertAttempt } from "../repositories/attemptRepository";
import {
	searchLoginCode,
	deleteLoginCode,
	deleteSessionToken,
	insertSessionToken,
	insertTempToken,
} from "../repositories/authTokenRepository";
import { getUserByEmail } from "@/features/user/repositories/userRepository";

export async function loginService({
	loginCode,
	ipAddress,
	deviceId,
	now,
}: {
	loginCode: string;
	ipAddress: string;
	deviceId: string;
	now: Date;
}): Promise<
	Result<{
		email: string;
		isNewUser: boolean;
		token: string;
		expiresAt: Date;
	}>
> {
	try {
		return await db.transaction(
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
					loginCodeHash: crypto
						.createHash("sha256")
						.update(loginCode)
						.digest("hex"),
					now,
				});

				if (!founded) {
					await insertAttempt({
						tx,
						ipAddress,
						email: null,
						attemptType: "code_verify",
						success: false,
					});

					return {
						success: false,
						error: {
							code: "UNAUTHORIZED_ERROR",
							message:
								"使用できないログインコードです。もう一度発行してください。",
						},
					};
				}

				await insertAttempt({
					tx,
					ipAddress,
					email: founded.email,
					attemptType: "code_verify",
					success: true,
				});

				await deleteLoginCode({ tx, email: founded.email });
				const user = await getUserByEmail(tx, founded.email);

				if (user) {
					const { sessionToken: newToken, expiresAt } =
						await refreshSessionToken({
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
				const expiresAt = new Date(now.getTime() + 15 * 60 * 1000);

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
	} catch (err) {
		console.error(err);
		return {
			success: false,
			error: {
				code: "INTERNAL_ERROR",
				message: "システム内部でエラーが発生しています。",
			},
		};
	}
}

function generateTempSessionToken() {
	return crypto.randomBytes(32).toString("hex");
}

async function generateSessionToken({
	userId,
	email,
	deviceId,
}: {
	userId: number;
	email: string;
	deviceId: string;
}) {
	const secretKey = getSecretKey();

	return await new SignJWT({
		userId: userId.toString(),
		email,
		deviceId,
		type: "session_token",
	})
		.setProtectedHeader({ alg: "HS256" })
		.setExpirationTime("30d")
		.setIssuedAt()
		.sign(secretKey);
}

async function refreshSessionToken({
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
	await deleteSessionToken({ tx, userId: user.id, deviceId });

	const sessionToken = await generateSessionToken({
		userId: user.id,
		email: user.email,
		deviceId,
	});

	const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

	await insertSessionToken({
		tx,
		sessionToken,
		deviceId,
		email: user.email,
		userId: user.id,
		now,
		expiresAt: expiresAt,
	});

	return { sessionToken, expiresAt };
}
