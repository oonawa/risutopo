import type { Tx } from "@/db/client";
import { db } from "@/db/client";
import { and, eq, gt } from "drizzle-orm";
import { loginAttemptsTable } from "@/db/schema";

export async function RecentAttempts(
	ipAddress: string,
	attemptType: "code_verify" | "code_send",
	windowStart: Date,
) {
	return await db
		.select()
		.from(loginAttemptsTable)
		.where(
			and(
				eq(loginAttemptsTable.ipAddress, ipAddress),
				eq(loginAttemptsTable.attemptType, attemptType),
				gt(loginAttemptsTable.attemptedAt, windowStart),
			),
		);
}

export async function insertAttempt({
	tx,
	ipAddress,
	email,
	attemptType,
	success,
}: {
	tx?: Tx;
	ipAddress: string;
	email: string | null;
	attemptType: "code_verify" | "code_send";
	success: boolean;
}): Promise<void> {
	const executor = tx ?? db;

	await executor.insert(loginAttemptsTable).values({
		ipAddress,
		email,
		attemptType,
		attemptedAt: new Date(),
		success,
	});
}
