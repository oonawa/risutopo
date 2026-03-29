import crypto from "node:crypto";
import { db } from "@/db/client";
import type { Result } from "@/features/shared/types/Result";
import { getUserByEmail } from "@/features/user/repositories/userRepository";
import { insertAttempt } from "../repositories/attemptRepository";
import {
	deleteLoginCode,
	insertDeleteIntentToken,
	searchLoginCode,
} from "../repositories/authTokenRepository";

export async function issueDeleteIntentTokenService({
	loginCode,
	userId,
	ipAddress,
	now,
}: {
	loginCode: string;
	userId: number;
	ipAddress: string;
	now: Date;
}): Promise<Result<{ token: string; expiresAt: Date }>> {
	try {
		return await db.transaction(
			async (tx): Promise<Result<{ token: string; expiresAt: Date }>> => {
				const found = await searchLoginCode({
					tx,
					loginCodeHash: crypto
						.createHash("sha256")
						.update(loginCode)
						.digest("hex"),
					now,
				});

				if (!found) {
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

				const user = await getUserByEmail(tx, found.email);
				if (!user || user.id !== userId) {
					await insertAttempt({
						tx,
						ipAddress,
						email: found.email,
						attemptType: "code_verify",
						success: false,
					});

					return {
						success: false,
						error: {
							code: "FORBIDDEN_ERROR",
							message: "このコードは使用できません。",
						},
					};
				}

				await insertAttempt({
					tx,
					ipAddress,
					email: found.email,
					attemptType: "code_verify",
					success: true,
				});

				await deleteLoginCode({ tx, email: found.email });

				const token = crypto.randomBytes(32).toString("hex");
				const expiresAt = new Date(now.getTime() + 15 * 60 * 1000);

				await insertDeleteIntentToken({ tx, token, userId, expiresAt, createdAt: now });

				return {
					success: true,
					data: { token, expiresAt },
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
