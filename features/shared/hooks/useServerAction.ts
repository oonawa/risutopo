import { useCallback, useEffect, useRef, useState, useTransition } from "react";

const TIMEOUT_MESSAGE = "通信がタイムアウトしました。再度お試しください。";
const NETWORK_ERROR_MESSAGE =
	"通信エラーが発生しました。ネットワーク接続を確認してください。";
const DEFAULT_TIMEOUT_MS = 15_000;

type Options = {
	timeoutMs?: number;
};

export const useServerAction = (options?: Options) => {
	const [isPending, startTransition] = useTransition();
	const [networkError, setNetworkError] = useState<string | null>(null);
	const optionsRef = useRef(options);

	useEffect(() => {
		optionsRef.current = options;
	});

	const execute = useCallback(
		(callback: () => Promise<void>) => {
			startTransition(async () => {
				const timeoutMs = optionsRef.current?.timeoutMs ?? DEFAULT_TIMEOUT_MS;

				const timeoutPromise = new Promise<never>((_, reject) =>
					setTimeout(() => reject(new Error("TIMEOUT")), timeoutMs),
				);

				try {
					await Promise.race([callback(), timeoutPromise]);
				} catch (e) {
					const message =
						e instanceof Error && e.message === "TIMEOUT"
							? TIMEOUT_MESSAGE
							: NETWORK_ERROR_MESSAGE;
					setNetworkError(message);
				}
			});
		},
		[],
	);

	const clearNetworkError = useCallback(() => setNetworkError(null), []);

	return { execute, isPending, networkError, clearNetworkError };
};
