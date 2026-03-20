import { useActionState, startTransition } from "react";
import { TMDB_IMAGE_BASE_URL } from "@/app/consts";
import type { DraftListItem, ListItem } from "@/features/list/types/ListItem";
import type { TmdbSearchResponse } from "@/features/movieDatabase/types/TmdbResponse";
import { searchExternalMovieDatabase } from "@/features/movieDatabase/actions/searchExternalMovieDatabase";
import { getDirectorsFromExternalMovieDatabase } from "@/features/movieDatabase/actions/getDirectorsFromExternalMovieDatabase";
import { getMovieFromExternalMovieDatabase } from "@/features/movieDatabase/actions/getMovieFromExternalMovieDatabase";

type Props = {
	movie: DraftListItem | ListItem;
};

export const useExternalMovieDatabase = ({ movie }: Props) => {
	const normalizeTitle = (title: string) => {
		return title
			.replace(/･/g, "・")
			.replace(/\(/g, "（")
			.replace(/\)/g, "）")
			.replace(/\s+/g, " ")
			.replace(/（吹替版）/g, "")
			.replace(/（字幕版）/g, "")
			.replace(/™/g, "")
			.trim();
	};

	const normalizedTitle = normalizeTitle(movie.title);

	const [
		searchResult,
		searchExternalMovieDatabaseAction,
		isSearchExternalMovieDatabasePending,
	] = useActionState(
		async (prev: TmdbSearchResponse | null, page: number | null) => {
			if (!page) {
				return null;
			}

			if (prev && page === 1) {
				return prev;
			}

			const result = await searchExternalMovieDatabase(
				normalizedTitle,
				String(page),
			);

			if (!result.success) {
				return prev;
			}

			if (!prev) {
				return result.data;
			}

			return {
				...result.data,
				results: [...prev.results, ...result.data.results],
			};
		},
		null,
	);

	const [
		selectedMovie,
		fetchExternalMovieDatabaseAction,
		isFetchExternalMovieDatabasePending,
	] = useActionState<DraftListItem | ListItem | null, number | null>(
		async (_prev, externalApiMovieId) => {
			if (externalApiMovieId === null) {
				return null;
			}

			const now = new Date();

			const [officialMovieInfo, directorsInfo] = await Promise.all([
				getMovieFromExternalMovieDatabase(externalApiMovieId, now),
				getDirectorsFromExternalMovieDatabase(externalApiMovieId, now),
			]);

			if (!officialMovieInfo.success || !directorsInfo.success) {
				return null;
			}

			const {
				movieId,
				title,
				release_date,
				runtime,
				poster_path,
				backdrop_path,
				overview,
			} = officialMovieInfo.data;

			const details = {
				movieId,
				officialTitle: title,
				backgroundImage: TMDB_IMAGE_BASE_URL + backdrop_path,
				posterImage: TMDB_IMAGE_BASE_URL + poster_path,
				runningMinutes: runtime,
				releaseYear: new Date(release_date).getFullYear(),
				director: directorsInfo.data,
				externalDatabaseMovieId: externalApiMovieId,
				overview,
			};

			if ("listItemId" in movie) {
				if (movie.isWatched) {
					return {
						listItemId: movie.listItemId,
						title: movie.title,
						url: movie.url,
						serviceSlug: movie.serviceSlug,
						serviceName: movie.serviceName,
						isWatched: true,
						watchedAt: movie.watchedAt,
						createdAt: movie.createdAt,
						details,
					};
				}

				return {
					listItemId: movie.listItemId,
					title: movie.title,
					url: movie.url,
					serviceSlug: movie.serviceSlug,
					serviceName: movie.serviceName,
					isWatched: false,
					watchedAt: null,
					createdAt: movie.createdAt,
					details,
				};
			}

			if (movie.isWatched) {
				return {
					title: movie.title,
					url: movie.url,
					serviceSlug: movie.serviceSlug,
					serviceName: movie.serviceName,
					isWatched: true,
					watchedAt: movie.watchedAt,
					createdAt: movie.createdAt,
					details,
				};
			}

			return {
				title: movie.title,
				url: movie.url,
				serviceSlug: movie.serviceSlug,
				serviceName: movie.serviceName,
				isWatched: false,
				watchedAt: null,
				createdAt: movie.createdAt,
				details,
			};
		},
		null,
	);

	const handleSearch = (page = 1) => {
		startTransition(() => {
			searchExternalMovieDatabaseAction(page);
		});
	};

	const handleSelect = (externalApiMovieId: number) => {
		startTransition(() => {
			fetchExternalMovieDatabaseAction(externalApiMovieId);
		});
	};

	const handleSelectCnacel = () => {
		startTransition(() => {
			fetchExternalMovieDatabaseAction(null);
		});
	};

	const handleSearchCancel = () => {
		startTransition(() => {
			searchExternalMovieDatabaseAction(null);
		});
	};

	return {
		selectedMovie,
		normalizedTitle,
		handleSearch,
		handleSelect,
		handleSelectCnacel,
		handleSearchCancel,
		searchResult,
		isSearchExternalMovieDatabasePending,
		isFetchExternalMovieDatabasePending,
	};
};
