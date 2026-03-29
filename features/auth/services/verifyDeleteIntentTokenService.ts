import type { Result } from "@/features/shared/types/Result";
import { searchDeleteIntentToken } from "../repositories/authTokenRepository";

export async function verifyDeleteIntentTokenService({
	token,
	now,
}: {
	token: string;
	now: Date;
}): Promise<Result<{ userId: number }>> {
	const record = await searchDeleteIntentToken({ token, now });

	if (!record) {
		return {
			success: false,
			error: {
				code: "UNAUTHORIZED_ERROR",
				message: "アカウント削除の認証が無効です。もう一度お試しください。",
			},
		};
	}

	return {
		success: true,
		data: { userId: record.userId },
	};
}
