"use client";

import { useCallback, useState } from "react";
import { useSetAtom } from "jotai";
import { appendMovieServiceAtom } from "@/app/store";
import { SUPPORTED_SERVICES } from "@/app/consts";
import type { SupportedServiceSlug } from "@/app/consts";

type AppendStoragePayload = {
	title: string;
	url: string;
	serviceSlug: SupportedServiceSlug;
};

export function useLocalStorage() {
	const appendMovieService = useSetAtom(appendMovieServiceAtom);
	const [storageErrorMessage, setStorageErrorMessage] = useState<string>("");

	const appendMovieToStorage = useCallback(
		({ title, url, serviceSlug }: AppendStoragePayload) => {
			const service = Object.values(SUPPORTED_SERVICES).find(
				(service) => service.slug === serviceSlug,
			);
			if (!service) {
				setStorageErrorMessage(
					"エラーが発生しました。お手数ですがやり直してください。",
				);
				return false;
			}

			appendMovieService({
				title,
				url,
				serviceName: service.name,
			});

			setStorageErrorMessage("");
			return true;
		},
		[appendMovieService],
	);

	return {
		storageErrorMessage,
		setStorageErrorMessage,
		appendMovieToStorage,
	};
}
