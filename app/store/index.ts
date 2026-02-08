// app/store/index.ts
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { SUPPORTED_SERVICES } from "@/app/consts";
import type { SupportedServiceName, SupportedServiceSlug } from "@/app/consts";
import type { Movie, MovieService } from "../types/models";

export const LOCAL_STORAGE_KEY = "risutopotto";

export type RisutopottoStorage = {
	movies_table: Movie[];
	movie_services_table: MovieService[];
	streaming_services_table: StreamingService[];
};

export type StreamingService = {
	id: number;
	name: SupportedServiceName;
	slug: SupportedServiceSlug;
};

export const streamingServicesSeed: StreamingService[] = Object.values(
	SUPPORTED_SERVICES,
).map(({ name, slug }, index) => ({
	id: index + 1,
	name,
	slug,
}));

export const defaultValue: RisutopottoStorage = {
	movies_table: [],
	movie_services_table: [],
	streaming_services_table: streamingServicesSeed,
};

// カスタムストレージ実装: 初期化・マイグレーション処理を含む
const customStorage = {
	getItem: (
		key: string,
		initialValue: RisutopottoStorage,
	): RisutopottoStorage => {
		const raw = localStorage.getItem(key);

		// データが存在しない場合は初期値を返す
		if (!raw) {
			return initialValue;
		}

		try {
			const parsed: Partial<RisutopottoStorage> = JSON.parse(raw);

			// 既存のstreaming_servicesを取得
			const existingStreamingServices = Array.isArray(
				parsed.streaming_services_table,
			)
				? parsed.streaming_services_table
				: [];

			// 新しく追加されたサービスのみを抽出（マイグレーション）
			const streamingServicesSeeded = streamingServicesSeed.filter(
				(seed) =>
					!existingStreamingServices.some(
						(existing) => existing.slug === seed.slug,
					),
			);

			// 正規化されたデータを返す
			const normalized: RisutopottoStorage = {
				movies_table: Array.isArray(parsed.movies_table)
					? parsed.movies_table
					: [],
				movie_services_table: Array.isArray(parsed.movie_services_table)
					? parsed.movie_services_table
					: [],
				streaming_services_table: [
					...existingStreamingServices,
					...streamingServicesSeeded,
				],
			};

			return normalized;
		} catch {
			// パースエラー時は初期値を返す
			return initialValue;
		}
	},
	setItem: (key: string, value: RisutopottoStorage): void => {
		localStorage.setItem(key, JSON.stringify(value));
	},
	removeItem: (key: string): void => {
		localStorage.removeItem(key);
	},
};

export const risutopottoAtom = atomWithStorage<RisutopottoStorage>(
	LOCAL_STORAGE_KEY,
	defaultValue,
	customStorage,
);

// movies_tableへの読み書き用atom
export const moviesTableAtom = atom(
	(get) => get(risutopottoAtom).movies_table,
	(get, set, update: Movie[] | ((prev: Movie[]) => Movie[])) => {
		const current = get(risutopottoAtom);
		const nextMovies =
			typeof update === "function" ? update(current.movies_table) : update;
		set(risutopottoAtom, { ...current, movies_table: nextMovies });
	},
);

// movie_services_tableへの読み書き用atom
export const movieServicesTableAtom = atom(
	(get) => get(risutopottoAtom).movie_services_table,
	(
		get,
		set,
		update: MovieService[] | ((prev: MovieService[]) => MovieService[]),
	) => {
		const current = get(risutopottoAtom);
		const nextServices =
			typeof update === "function"
				? update(current.movie_services_table)
				: update;
		set(risutopottoAtom, { ...current, movie_services_table: nextServices });
	},
);

// streaming_services_table（読み取り専用）
export const streamingServicesTableAtom = atom(
	(get) => get(risutopottoAtom).streaming_services_table,
);

// 映画とサービスを同時に追加するatom
export const appendMovieWithServiceAtom = atom(
	null,
	(
		get,
		set,
		payload: {
			title: string;
			watchUrl: string;
			streamingServiceId: number;
		},
	) => {
		const current = get(risutopottoAtom);
		const movieId = current.movies_table.length + 1;
		const movieServiceId = current.movie_services_table.length + 1;

		const nextMovies = [
			...current.movies_table,
			{ id: movieId, title: payload.title },
		];
		const nextMovieServices = [
			...current.movie_services_table,
			{
				id: movieServiceId,
				movieId,
				watchUrl: payload.watchUrl,
				streamingServiceId: payload.streamingServiceId,
			},
		];

		set(risutopottoAtom, {
			...current,
			movies_table: nextMovies,
			movie_services_table: nextMovieServices,
		});
	},
);
