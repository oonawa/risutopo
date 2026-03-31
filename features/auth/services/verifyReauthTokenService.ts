import type { Result } from "@/features/shared/types/Result";
import { deleteReauthToken, searchReauthToken } from "../repositories/authTokenRepository";

export async function verifyReauthTokenService({
	token,
	now,
}: {
	token: string;
	now: Date;
}): Promise<Result<{ userId: number }>> {
	const record = await searchReauthToken({ token, now });

	if (!record) {
		return {
			success: false,
			error: {
				code: "UNAUTHORIZED_ERROR",
				message: "再認証が無効です。もう一度お試しください。",
			},
		};
	}

	await deleteReauthToken({ token });

	return {
		success: true,
		data: { userId: record.userId },
	};
}
