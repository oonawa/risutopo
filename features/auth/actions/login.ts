"use server";

import { headers, cookies } from "next/headers";
import crypto from "node:crypto";
import type { Result } from "@/features/shared/types/Result";
import { loginCodeSchema } from "../schemas/loginSchemas";
import { checkRateLimitService } from "../services/checkRateLimitService";
import { loginService } from "../services/loginService";

export async function login(
	loginCode: string,
): Promise<
	Result<{
		email: string;
		isNewUser: boolean;
	}>
> {
	const now = new Date();
	const parsed = loginCodeSchema.safeParse({ value: loginCode });

	if (!parsed.success) {
		return {
			success: false,
			error: {
				code: "VALIDATION_ERROR",
				message: parsed.error.message,
			},
		};
	}

	const headersList = await headers();

	const { limit, ipAddress } = await checkRateLimitService({
		ipAddress:
			headersList.get("x-forwarded-for")?.split(",")[0] ||
			headersList.get("x-real-ip") ||
			"unknown",
		attemptType: "code_verify",
		now,
	});

	if (!limit.allowed && limit.retryAfter) {
		const minutesUntilRetry = Math.ceil(
			(limit.retryAfter.getTime() - now.getTime()) / 60000,
		);

		return {
			success: false,
			error: {
				code: "VALIDATION_ERROR",
				message: `試行回数が上限に達しています。${minutesUntilRetry}分後に再度お試しください。`,
			},
		};
	}

	const deviceId = crypto
		.createHash("sha256")
		.update(headersList.get("user-agent") || "Unknown")
		.digest("hex")
		.substring(0, 16);

	const result = await loginService({
		loginCode: parsed.data.value,
		deviceId,
		ipAddress,
		now,
	});

	if (!result.success) {
		return result;
	}

	const { isNewUser, token, expiresAt, email } = result.data;

	const cookieStore = await cookies();
	const key = isNewUser ? "temp_session_token" : "session_token";

	cookieStore.set(key, token, {
		httpOnly: true,
		secure: true,
		sameSite: "lax",
		expires: expiresAt,
	});

	return {
		success: true,
		data: {
			email,
			isNewUser,
		},
	};
}
