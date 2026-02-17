"use server";

import { headers, cookies } from "next/headers";
import type { Result } from "@/app/types/Result";
import { db } from "@/db/client";
import { and, eq } from "drizzle-orm";
import { usersTable, listsTable, authTokensTable } from "@/db/schema";
import { userIdSchema } from "../userIdSchema";
import { generateSessionToken, addDays } from "@/lib/auth";
import { generateDeviceId } from "@/lib/devices";
import { verifyTempSessionToken } from "@/lib/auth";

export async function registerUser({
	email,
	userId,
	tempToken,
	now,
}: {
	email: string;
	userId: string;
	tempToken: string;
	now: Date;
}): Promise<
	Result<{
		userId: string;
	}>
> {
	const tempSession = await verifyTempSessionToken({ tempToken, now });

	if (!tempSession) {
		return {
			success: false,
			error: { message: "セッションが無効です。最初からやり直してください。" },
		};
	}

	if (tempSession.email !== email) {
		return {
			success: false,
			error: { message: "メールアドレスが一致しません。" },
		};
	}

	const { error, data } = userIdSchema.safeParse({ userId });

	if (error) {
		return {
			success: false,
			error,
		};
	}

	const headersList = await headers();
	const userAgent = headersList.get("user-agent") || "Unknown";
	const deviceId = generateDeviceId(userAgent);

	try {
		const newUserId = await db.transaction(async (tx) => {
			const [newUser] = await tx
				.insert(usersTable)
				.values({
					publicId: data.userId,
					email: email,
				})
				.returning();

			await tx.insert(listsTable).values({
				userId: newUser.id,
			});
			const cookieStore = await cookies();
			const tempToken = cookieStore.get("temp_session_token")?.value;

			if (tempToken) {
				await tx
					.delete(authTokensTable)
					.where(
						and(
							eq(authTokensTable.token, tempToken),
							eq(authTokensTable.tokenType, "temp_session_token"),
						),
					);
			}

			const sessionToken = await generateSessionToken({
				userId: newUser.id,
				email: newUser.email,
				deviceId,
			});
			const expiresAt = addDays(now, 30);

			await tx.insert(authTokensTable).values({
				token: sessionToken,
				tokenType: "session_token",
				deviceId,
				email,
				userId: newUser.id,
				expiresAt: expiresAt,
				createdAt: now,
			});

			return newUser.publicId;
		});

		return {
			success: true,
			data: {
				userId: newUserId,
			},
		};
	} catch (err) {
		console.error(err);
		return {
			success: false,
			error: { message: "ユーザー登録の処理に失敗しました。" },
		};
	}
}
