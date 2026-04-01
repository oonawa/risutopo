"use server";

import { cache } from "react";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { userEmailsTable } from "@/db/schema";
import type { Result } from "../types/Result";
import { currentUserId } from "./currentUserId";
import { decrypt } from "@/features/shared/lib/encryption";

export const currentUserEmail = cache(
	async (): Promise<Result<{ email: string }>> => {
		const userIdResult = await currentUserId();

		if (!userIdResult.success) {
			return userIdResult;
		}

		const [record] = await db
			.select({ encryptedEmail: userEmailsTable.encryptedEmail })
			.from(userEmailsTable)
			.where(eq(userEmailsTable.userId, userIdResult.data.userId));

		if (!record) {
			return {
				success: false,
				error: {
					code: "NOT_FOUND_ERROR",
					message: "メールアドレスが見つかりません。",
				},
			};
		}

		return {
			success: true,
			data: { email: decrypt(record.encryptedEmail) },
		};
	},
);
