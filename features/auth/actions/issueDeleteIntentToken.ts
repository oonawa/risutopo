"use server";

import { cookies, headers } from "next/headers";
import type { Result } from "@/features/shared/types/Result";
import { loginCodeSchema } from "../schemas/loginSchemas";
import { checkRateLimitService } from "../services/checkRateLimitService";
import { issueDeleteIntentTokenService } from "../services/issueDeleteIntentTokenService";
import { verifySessionTokenService } from "../services/verifySessionTokenService";

export async function issueDeleteIntentToken(
	loginCode: string,
): Promise<Result> {
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

	const cookieStore = await cookies();
	const sessionToken = cookieStore.get("session_token")?.value;

	if (!sessionToken) {
		return {
			success: false,
			error: {
				code: "UNAUTHORIZED_ERROR",
				message: "ログインしていません。",
			},
		};
	}

	const verifiedSession = await verifySessionTokenService({ sessionToken, now });
	if (!verifiedSession.success) {
		return {
			success: false,
			error: {
				code: "UNAUTHORIZED_ERROR",
				message: "ログインしていません。",
			},
		};
	}

	const headersList = await headers();
	const ipAddress =
		headersList.get("x-forwarded-for")?.split(",")[0] ||
		headersList.get("x-real-ip") ||
		"unknown";

	const { limit } = await checkRateLimitService({
		ipAddress,
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
				code: "TOO_MANY_REQUESTS_ERROR",
				message: `試行回数が上限に達しました。${minutesUntilRetry}分後に再度お試しください。`,
			},
		};
	}

	const result = await issueDeleteIntentTokenService({
		loginCode: parsed.data.value,
		userId: verifiedSession.data.userId,
		ipAddress,
		now,
	});

	if (!result.success) {
		return result;
	}

	cookieStore.set("delete_intent_token", result.data.token, {
		httpOnly: true,
		secure: true,
		sameSite: "lax",
		expires: result.data.expiresAt,
	});

	return { success: true };
}
