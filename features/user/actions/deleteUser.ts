"use server";

import { cookies } from "next/headers";
import { verifySessionTokenService } from "@/features/auth/services/verifySessionTokenService";
import { verifyReauthTokenService } from "@/features/auth/services/verifyReauthTokenService";
import type { Result } from "@/features/shared/types/Result";
import { deleteUserService } from "../services/deleteUserService";

export async function deleteUser(): Promise<Result> {
	const now = new Date();
	const cookieStore = await cookies();
	const sessionToken = cookieStore.get("session_token")?.value;
	const reauthToken = cookieStore.get("delete_account_reauth_token")?.value;

	if (!sessionToken) {
		return {
			success: false,
			error: {
				code: "UNAUTHORIZED_ERROR",
				message: "ログインしていません。",
			},
		};
	}

	if (!reauthToken) {
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

	const verifiedReauth = await verifyReauthTokenService({
		token: reauthToken,
		now,
	});
	if (!verifiedReauth.success) {
		return verifiedReauth;
	}

	if (verifiedSession.data.userId !== verifiedReauth.data.userId) {
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
	cookieStore.delete("delete_account_reauth_token");

	return { success: true };
}
