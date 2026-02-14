import { db } from "@/db/client";
import { loginAttemptsTable } from "@/db/schema";
import { and, eq, gt, lt } from "drizzle-orm";
import type { Executor } from "@/db/client";

export async function checkRateLimit({
	ipAddress,
	attemptType,
}: {
	ipAddress: string;
	attemptType: "code_verify" | "code_send";
}): Promise<{
	limit: {
		allowed: boolean;
		remainingAttempts?: number;
		retryAfter?: Date;
	};
	ipAddress: string;
}> {
	const now = new Date();
	const windowStart = new Date(now.getTime() - 15 * 60 * 1000); // 15分

	const attempts = await db
		.select()
		.from(loginAttemptsTable)
		.where(
			and(
				eq(loginAttemptsTable.ipAddress, ipAddress),
				eq(loginAttemptsTable.attemptType, attemptType),
				gt(loginAttemptsTable.attemptedAt, windowStart),
			),
		);

	const maxAttempts = attemptType === "code_verify" ? 3 : 3;

	if (attempts.length >= maxAttempts) {
		const oldestAttempt = attempts.sort(
			(a, b) => a.attemptedAt.getTime() - b.attemptedAt.getTime(),
		)[0];

		const retryAfter = new Date(
			oldestAttempt.attemptedAt.getTime() + 15 * 60 * 1000,
		);

		return {
			limit: {
				allowed: false,
				retryAfter,
			},
			ipAddress,
		};
	}

	return {
		limit: {
			allowed: true,
			remainingAttempts: maxAttempts - attempts.length,
		},
		ipAddress,
	};
}

export async function recordAttempt({
	executor,
	ipAddress,
	email,
	attemptType,
	success,
}: {
	executor: Executor;
	ipAddress: string;
	email: string | null;
	attemptType: "code_verify" | "code_send";
	success: boolean;
}): Promise<void> {
	await executor.insert(loginAttemptsTable).values({
		ipAddress,
		email,
		attemptType,
		attemptedAt: new Date(),
		success,
	});
}

/**
 * 古いログイン試行の記録を削除する
 * 定期バッチで実行する想定
 */
export async function cleanupOldAttempts(): Promise<void> {
	const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24時間前
	await db
		.delete(loginAttemptsTable)
		.where(lt(loginAttemptsTable.attemptedAt, cutoffDate));
}
