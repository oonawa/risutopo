import type { Result } from "@/features/shared/types/Result";

type FetchWithRetryOptions = {
	maxRetries: number;
	delays: number[];
};

const TIMEOUT_MS = 4000;

const sleep = (ms: number) =>
	new Promise<void>((resolve) => setTimeout(resolve, ms));

export async function fetchWithRetry(
	url: string,
	init: RequestInit,
	options: FetchWithRetryOptions,
): Promise<Result<Response>> {
	const { maxRetries, delays } = options;

	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

		let response: Response;
		try {
			response = await fetch(url, { ...init, signal: controller.signal });
		} catch {
			clearTimeout(timeoutId);
			if (attempt < maxRetries) {
				await sleep(delays[attempt] ?? 500);
				continue;
			}
			return {
				success: false,
				error: {
					code: "NETWORK_ERROR",
					message: "外部サービスとの通信に失敗しました。",
				},
			};
		}

		clearTimeout(timeoutId);

		if (response.status === 429) {
			return {
				success: false,
				error: {
					code: "TOO_MANY_REQUESTS_ERROR",
					message:
						"リクエストが多すぎます。しばらく待ってから再度お試しください。",
				},
			};
		}

		if (response.status >= 400 && response.status < 500) {
			return {
				success: false,
				error: {
					code: "INTERNAL_ERROR",
					message: "連携している外部サービスとの接続に不具合があります。",
				},
			};
		}

		if (response.status >= 500) {
			if (attempt < maxRetries) {
				await sleep(delays[attempt] ?? 500);
				continue;
			}
			return {
				success: false,
				error: {
					code: "NETWORK_ERROR",
					message: "外部サービスとの通信に失敗しました。",
				},
			};
		}

		return { success: true, data: response };
	}

	return {
		success: false,
		error: {
			code: "NETWORK_ERROR",
			message: "外部サービスとの通信に失敗しました。",
		},
	};
}
