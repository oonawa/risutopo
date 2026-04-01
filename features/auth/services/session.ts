import { db } from "@/db/client";
import { tempSessionTokensTable } from "@/db/schema";
import { and, eq, gt } from "drizzle-orm";
import { decrypt } from "@/features/shared/lib/encryption";

export async function verifyTempSessionToken({
	tempToken,
	now,
}: {
	tempToken?: string;
	now: Date;
}): Promise<{
	email: string;
	emailHmac: string;
} | null> {
	if (!tempToken) {
		return null;
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
			return null;
		}

		return {
			email: decrypt(record.encryptedEmail),
			emailHmac: record.emailHmac,
		};
	} catch (error) {
		console.error("Temp token verification failed:", error);
		return null;
	}
}
