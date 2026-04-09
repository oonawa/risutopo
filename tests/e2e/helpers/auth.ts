import type { BrowserContext } from "@playwright/test";
import crypto from "node:crypto";
import {
	listsTable,
	sessionTokensTable,
	userEmailsTable,
	usersTable,
} from "@/db/schema";
import { generateDeviceId } from "@/features/auth/services/devices";
import { computeHmac, encrypt } from "@/features/shared/lib/encryption";
import { generateSessionToken } from "@/features/shared/lib/jwt";
import { db } from "../lib/testDb";

export async function setupAuthenticatedUser(
	context: BrowserContext,
	userAgent: string,
	baseUrl: string,
) {
	// テストユーザーを DB に作成
	const [user] = await db
		.insert(usersTable)
		.values({ publicId: crypto.randomUUID() })
		.returning({ id: usersTable.id });

	await db.insert(userEmailsTable).values({
		userId: user.id,
		encryptedEmail: encrypt("test@example.com"),
		emailHmac: computeHmac("test@example.com"),
	});

	await db.insert(listsTable).values({
		publicId: crypto.randomUUID(),
		userId: user.id,
	});

	// JWT セッショントークンを生成して DB に保存
	const deviceId = generateDeviceId(userAgent);
	const sessionToken = await generateSessionToken({ userId: user.id, deviceId });
	const now = new Date();
	const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

	await db.insert(sessionTokensTable).values({
		token: sessionToken,
		deviceId,
		userId: user.id,
		createdAt: now,
		expiresAt,
	});

	// BrowserContext に session_token Cookie を設定
	await context.addCookies([
		{
			name: "session_token",
			value: sessionToken,
			url: baseUrl,
			httpOnly: true,
		},
	]);
}
