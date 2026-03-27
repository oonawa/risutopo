"use server";

import crypto from "node:crypto";
import { headers, cookies } from "next/headers";
import { db } from "@/db/client";
import { eq } from "drizzle-orm";
import {
	usersTable,
	userEmailsTable,
	listsTable,
	sessionTokensTable,
	tempSessionTokensTable,
} from "@/db/schema";
import type { Result } from "@/features/shared/types/Result";
import type { LocalList } from "@/features/user/schemas/localListSchema";
import { localListSchema } from "@/features/user/schemas/localListSchema";
import { userIdSchema } from "../schemas/userIdSchema";
import {
	verifyTempSessionToken,
	generateSessionToken,
	addDays,
} from "@/features/auth/services/session";
import { generateDeviceId } from "@/features/auth/services/devices";
import { syncUserListService } from "@/features/list/services/syncUserListService";

const emptyLocalList: LocalList = {
	listId: "",
	items: [],
};

export async function registerUser({
	email,
	userId,
	tempToken,
	localUserList,
	now,
}: {
	email: string;
	userId: string;
	tempToken: string;
	localUserList: LocalList;
	now: Date;
}): Promise<Result<{ userId: string; publicListId: string }>> {
	const tempSession = await verifyTempSessionToken({ tempToken, now });

	if (!tempSession) {
		return {
			success: false,
			error: {
				code: "UNAUTHORIZED_ERROR",
				message: "セッションが無効です。最初からやり直してください。",
			},
		};
	}

	if (tempSession.email !== email) {
		return {
			success: false,
			error: {
				code: "UNAUTHORIZED_ERROR",
				message: "メールアドレスが一致しません。",
			},
		};
	}

	const { error, data } = userIdSchema.safeParse({ userId });

	if (error) {
		return {
			success: false,
			error: {
				code: "VALIDATION_ERROR",
				message: error.message,
			},
		};
	}

	const headersList = await headers();
	const userAgent = headersList.get("user-agent") || "Unknown";
	const deviceId = generateDeviceId(userAgent);
	const parsedLocalList = localListSchema.safeParse(localUserList);
	const normalizedLocalList = parsedLocalList.success
		? parsedLocalList.data
		: emptyLocalList;
	const validLocalListItems = normalizedLocalList.items;

	let transactionResult: {
		id: number;
		publicId: string;
		publicListId: string;
		sessionToken: string;
		expiresAt: Date;
	};

	try {
		transactionResult = await db.transaction(async (tx) => {
			const [newUser] = await tx
				.insert(usersTable)
				.values({
					publicId: data.userId,
				})
				.returning({
					id: usersTable.id,
					publicId: usersTable.publicId,
				});

			await tx.insert(userEmailsTable).values({
				userId: newUser.id,
				email,
			});

			const normalizedPublicListId =
				normalizedLocalList.listId.length > 0
					? normalizedLocalList.listId
					: crypto.randomUUID();
			const [newList] = await tx
				.insert(listsTable)
				.values({
					publicId: normalizedPublicListId,
					userId: newUser.id,
				})
				.returning({
					id: listsTable.id,
					publicId: listsTable.publicId,
				});

			if (validLocalListItems.length > 0) {
				await syncUserListService({
					listId: newList.id,
					items: validLocalListItems,
				});
			}

			const cookieStore = await cookies();
			const tempToken = cookieStore.get("temp_session_token")?.value;

			if (tempToken) {
				await tx
					.delete(tempSessionTokensTable)
					.where(eq(tempSessionTokensTable.token, tempToken));
			}

			const sessionToken = await generateSessionToken({
				userId: newUser.id,
				email,
				deviceId,
			});
			const expiresAt = addDays(now, 30);

			await tx.insert(sessionTokensTable).values({
				token: sessionToken,
				deviceId,
				email,
				userId: newUser.id,
				expiresAt: expiresAt,
				createdAt: now,
			});

			return {
				id: newUser.id,
				publicId: newUser.publicId,
				publicListId: newList.publicId,
				sessionToken,
				expiresAt,
			};
		});

		const cookieStore = await cookies();
		cookieStore.set("session_token", transactionResult.sessionToken, {
			httpOnly: true,
			secure: true,
			sameSite: "lax",
			expires: transactionResult.expiresAt,
		});
	} catch (err) {
		console.error(err);
		return {
			success: false,
			error: {
				code: "INTERNAL_ERROR",
				message: "ユーザー登録の処理に失敗しました。",
			},
		};
	}

	return {
		success: true,
		data: {
			userId: transactionResult.publicId,
			publicListId: transactionResult.publicListId,
		},
	};
}
