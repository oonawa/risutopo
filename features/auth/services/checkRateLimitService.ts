import { RecentAttempts } from "../repositories/attemptRepository";

export async function checkRateLimitService({
	ipAddress,
	attemptType,
	now,
}: {
	ipAddress: string;
	attemptType: "code_verify" | "code_send";
	now: Date;
}): Promise<{
	limit: {
		allowed: boolean;
		remainingAttempts?: number;
		retryAfter?: Date;
	};
	ipAddress: string;
}> {
	const windowStart = new Date(now.getTime() - 15 * 60 * 1000); // 15分
	const attempts = await RecentAttempts(ipAddress, attemptType, windowStart);

	const maxAttempts = attemptType === "code_verify" ? 3 : 3;

	if (attempts.length >= maxAttempts) {
		const oldestAttempt = attempts.sort(
			(a, b) => a.attemptedAt.getTime() - b.attemptedAt.getTime(),
		)[0];

		const retryAfter = new Date(
			oldestAttempt.attemptedAt.getTime() + 15 * 60 * 1000,
		);

		return {
			limit: {
				allowed: false,
				retryAfter,
			},
			ipAddress,
		};
	}

	return {
		limit: {
			allowed: true,
			remainingAttempts: maxAttempts - attempts.length,
		},
		ipAddress,
	};
}
