import { useCallback, useEffect, useRef } from "react";
import type { MovieInputValues } from "@/app/types/MovieInputForm/MovieInputValues";

type Props<Result> = {
	handleSubmit: (values: MovieInputValues) => Promise<Result>;
	delayMs?: number;
};

export function useDebounce<Result>({
	handleSubmit,
	delayMs = 400,
}: Props<Result>) {
	type DebouncedResult = Result;

	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const lastArgsRef = useRef<MovieInputValues | null>(null);
	const pendingResolveRef = useRef<((value: DebouncedResult | null) => void) | null>(
		null,
	);

	const debouncedHandleSubmit = useCallback(
		(values: MovieInputValues) => {
			lastArgsRef.current = values;

			if (debounceRef.current) {
				clearTimeout(debounceRef.current);
				debounceRef.current = null;
			}

			if (pendingResolveRef.current) {
				pendingResolveRef.current(null);
				pendingResolveRef.current = null;
			}

			return new Promise<DebouncedResult | null>((resolve) => {
				pendingResolveRef.current = resolve;
				debounceRef.current = setTimeout(async () => {
					const lastArgs = lastArgsRef.current;
					if (!lastArgs) {
						resolve(null);
						pendingResolveRef.current = null;
						return;
					}
					const result = await handleSubmit(lastArgs);
					resolve(result);
					pendingResolveRef.current = null;
				}, delayMs);
			});
		},
		[handleSubmit, delayMs],
	);

	useEffect(() => {
		return () => {
			if (debounceRef.current) {
				clearTimeout(debounceRef.current);
			}
			if (pendingResolveRef.current) {
				pendingResolveRef.current(null);
				pendingResolveRef.current = null;
			}
		};
	}, []);

	return debouncedHandleSubmit;
}
