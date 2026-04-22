import type { Result } from "@/features/shared/types/Result";
import { db } from "@/db/client";
import { tempSessionTokensTable } from "@/db/schema";
import { and, eq, gt } from "drizzle-orm";
import { decrypt } from "@/features/shared/lib/encryption";

export async function verifyTempSessionTokenService({
	tempToken,
	now,
}: {
	tempToken?: string;
	now: Date;
}): Promise<Result<{ email: string; emailHmac: string }>> {
	if (!tempToken) {
		return {
			success: false,
			error: {
				code: "UNAUTHORIZED_ERROR",
				message: "セッションが無効です。最初からやり直してください。",
			},
		};
	}

	try {
		const [record] = await db
			.select({
				emailHmac: tempSessionTokensTable.emailHmac,
				encryptedEmail: tempSessionTokensTable.encryptedEmail,
			})
			.from(tempSessionTokensTable)
			.where(
				and(
					eq(tempSessionTokensTable.token, tempToken),
					gt(tempSessionTokensTable.expiresAt, now),
				),
			);

		if (!record) {
			return {
				success: false,
				error: {
					code: "UNAUTHORIZED_ERROR",
					message: "セッションが無効です。最初からやり直してください。",
				},
			};
		}

		return {
			success: true,
			data: {
				email: decrypt(record.encryptedEmail),
				emailHmac: record.emailHmac,
			},
		};
	} catch (error) {
		console.error("Temp token verification failed:", error);
		return {
			success: false,
			error: {
				code: "INTERNAL_ERROR",
				message: "不明なエラーが発生しました。",
			},
		};
	}
}
