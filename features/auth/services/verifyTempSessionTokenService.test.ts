import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/db/client";
import { tempSessionTokensTable, usersTable } from "@/db/schema";
import { computeHmac, encrypt } from "@/features/shared/lib/encryption";
import { generateTempSessionToken } from "@/features/shared/lib/jwt";
import { verifyTempSessionTokenService } from "./verifyTempSessionTokenService";

describe("verifyTempSessionTokenService", () => {
	const now = new Date("2026-02-16T00:00:00.000Z");

	beforeEach(async () => {
		await db.delete(tempSessionTokensTable);
		await db.delete(usersTable);
	});

	it("有効な仮認証トークンでemailとemailHmacを返す", async () => {
		const email = "verify-temp-session-token-service-test@example.com";
		const tempToken = generateTempSessionToken();

		await db.insert(tempSessionTokensTable).values({
			token: tempToken,
			emailHmac: computeHmac(email),
			encryptedEmail: encrypt(email),
			deviceId: "verify-temp-session-token-service-device-id",
			expiresAt: new Date(now.getTime() + 10 * 60 * 1000),
			createdAt: now,
		});

		const result = await verifyTempSessionTokenService({ tempToken, now });

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toStrictEqual({
				email,
				emailHmac: computeHmac(email),
			});
		}
	});

	it("tempTokenが未定義の場合はUNAUTHORIZED_ERRORを返す", async () => {
		const result = await verifyTempSessionTokenService({
			tempToken: undefined,
			now,
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.code).toBe("UNAUTHORIZED_ERROR");
		}
	});

	it("有効期限切れのトークンはUNAUTHORIZED_ERRORを返す", async () => {
		const email = "expired@example.com";
		const tempToken = generateTempSessionToken();

		await db.insert(tempSessionTokensTable).values({
			token: tempToken,
			emailHmac: computeHmac(email),
			encryptedEmail: encrypt(email),
			deviceId: "expired-device-id",
			expiresAt: new Date(now.getTime() - 1), // 期限切れ
			createdAt: now,
		});

		const result = await verifyTempSessionTokenService({ tempToken, now });

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.code).toBe("UNAUTHORIZED_ERROR");
		}
	});

	it("存在しないトークンはUNAUTHORIZED_ERRORを返す", async () => {
		const result = await verifyTempSessionTokenService({
			tempToken: "nonexistent-token",
			now,
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.code).toBe("UNAUTHORIZED_ERROR");
		}
	});
});
