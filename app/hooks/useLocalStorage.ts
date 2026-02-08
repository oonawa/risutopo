"use client";

import { useCallback, useState } from "react";
import { useAtom, useSetAtom } from "jotai";
import {
	appendMovieWithServiceAtom,
	streamingServicesTableAtom,
} from "@/app/store";
import type { SupportedServiceSlug } from "@/app/consts";

type AppendStoragePayload = {
	title: string;
	url: string;
	serviceSlug: SupportedServiceSlug;
};

export function useLocalStorage() {
	const [streamingServices] = useAtom(streamingServicesTableAtom);
	const appendMovieWithService = useSetAtom(appendMovieWithServiceAtom);
	const [storageErrorMessage, setStorageErrorMessage] = useState<string>("");

	const appendMovieToStorage = useCallback(
		({ title, url, serviceSlug }: AppendStoragePayload) => {
			const service = streamingServices.find(
				(service) => service.slug === serviceSlug,
			);
			if (!service) {
				setStorageErrorMessage(
					"エラーが発生しました。お手数ですがやり直してください。",
				);
				return false;
			}

			appendMovieWithService({
				title,
				watchUrl: url,
				streamingServiceId: service.id,
			});

			setStorageErrorMessage("");
			return true;
		},
		[appendMovieWithService, streamingServices],
	);

	return {
		storageErrorMessage,
		setStorageErrorMessage,
		appendMovieToStorage,
	};
}
