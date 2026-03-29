"use server";

import { cookies } from "next/headers";
import { verifySessionTokenService } from "@/features/auth/services/verifySessionTokenService";
import { verifyDeleteIntentTokenService } from "@/features/auth/services/verifyDeleteIntentTokenService";
import type { Result } from "@/features/shared/types/Result";
import { deleteUserService } from "../services/deleteUserService";

export async function deleteUser(): Promise<Result> {
	const now = new Date();
	const cookieStore = await cookies();
	const sessionToken = cookieStore.get("session_token")?.value;
	const deleteIntentToken = cookieStore.get("delete_intent_token")?.value;

	if (!sessionToken) {
		return {
			success: false,
			error: {
				code: "UNAUTHORIZED_ERROR",
				message: "ログインしていません。",
			},
		};
	}

	if (!deleteIntentToken) {
		return {
			success: false,
			error: {
				code: "UNAUTHORIZED_ERROR",
				message: "アカウント削除の認証が必要です。",
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

	const verifiedIntent = await verifyDeleteIntentTokenService({
		token: deleteIntentToken,
		now,
	});
	if (!verifiedIntent.success) {
		return verifiedIntent;
	}

	if (verifiedSession.data.userId !== verifiedIntent.data.userId) {
		return {
			success: false,
			error: {
				code: "FORBIDDEN_ERROR",
				message: "アカウント削除の認証が無効です。",
			},
		};
	}

	const result = await deleteUserService({
		userId: verifiedSession.data.userId,
		now,
	});

	if (!result.success) {
		return result;
	}

	cookieStore.delete("session_token");
	cookieStore.delete("delete_intent_token");

	return { success: true };
}
