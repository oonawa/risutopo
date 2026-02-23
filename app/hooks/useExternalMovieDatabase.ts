import { useActionState, startTransition } from "react";
import type { MovieInfo } from "@/app/types/MovieInputForm/MovieInfo";
import type { MovieSearchApiResponse } from "@/app/types/MovieInputForm/MovieApi/MovieApiResponse";
import { searchOfficialMovieInfo } from "@/app/actions/searchOfficialMovieInfo";
import { getOfficialMovieDirectorsInfo } from "@/app/actions/getOfficialMovieDirectorsInfo";
import { getOfficialMovieInfo } from "@/app/actions/getOfficialMovieInfo";
import { TMDB_IMAGE_BASE_URL } from "@/app/consts";

type Props = {
	movie: MovieInfo;
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
			.trim();
	};

	const normalizedTitle = normalizeTitle(movie.title);

	const [searchResult, searchResultAction, isSearchPending] = useActionState(
		async (prev: MovieSearchApiResponse | null, page: number | null) => {
			if (!page) {
				return null;
			}

			const result = await searchOfficialMovieInfo(
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

	const [currentMovieInfo, getOfficialMovieAction, isGetMoviePending] =
		useActionState<MovieInfo | null, number | null>(
			async (_prev: MovieInfo | null, externalApiMovieId: number | null) => {
				if (!externalApiMovieId) {
					return null;
				}

				const now = new Date();

				const [officialMovieInfo, directorsInfo] = await Promise.all([
					getOfficialMovieInfo(externalApiMovieId, now),
					getOfficialMovieDirectorsInfo(externalApiMovieId, now),
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
					overview
				} = officialMovieInfo.data;

				const directors = directorsInfo.data;

				return {
					listItemId: movie.listItemId,
					title: movie.title,
					url: movie.url,
					serviceSlug: movie.serviceSlug,
					serviceName: movie.serviceName,
					details: {
						movieId,
						officialTitle: title,
						backgroundImage: TMDB_IMAGE_BASE_URL + backdrop_path,
						posterImage: TMDB_IMAGE_BASE_URL + poster_path,
						runnningMinutes: runtime,
						releaseYear: new Date(release_date).getFullYear(),
						director: directors,
						externalDatabaseMovieId: externalApiMovieId,
						overview
					},
				};
			},
			null,
		);

	const handleSearch = (page = 1) => {
		startTransition(() => {
			searchResultAction(page);
		});
	};

	const handleSelect = (externalApiMovieId: number) => {
		startTransition(() => {
			getOfficialMovieAction(externalApiMovieId);
		});
	};

	const handleSelectCnacel = () => {
		startTransition(() => {
			getOfficialMovieAction(null);
		});
	};

	const handleSearchCancel = () => {
		startTransition(() => {
			searchResultAction(null);
		});
	};

	return {
		currentMovieInfo,
		normalizedTitle,
		handleSearch,
		handleSelect,
		handleSelectCnacel,
		handleSearchCancel,
		searchResult,
		isSearchPending,
		isGetMoviePending,
	};
};
