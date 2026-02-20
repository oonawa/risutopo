import { useActionState, startTransition } from "react";
import type { MovieInfo } from "@/app/types/MovieInputForm/MovieInfo";
import type { MovieSearchApiResponse } from "@/app/types/MovieInputForm/MovieApi/MovieApiResponse";
import MovieInfoContent from "./MovieInfoContent";
import { searchOfficialMovieInfo } from "@/app/actions/searchOfficialMovieInfo";
import { getOfficialMovieDirectorsInfo } from "@/app/actions/getOfficialMovieDirectorsInfo";
import { getOfficialMovieInfo } from "@/app/actions/getOfficialMovieInfo";
import MovieSearchResult from "./MovieSearchResult";
import { TMDB_IMAGE_BASE_URL } from "@/app/consts";

type Props = {
	movie: MovieInfo;
};

export default function RegisteredMovie({ movie }: Props) {
	const [searchResult, searchResultAction, isSearchPending] = useActionState(
		async (prev: MovieSearchApiResponse | null, page: number | null) => {
			if (!page) {
				return null;
			}

			const result = await searchOfficialMovieInfo(movie.title, String(page));
			// const result = await searchOfficialMovieInfo("スター", String(page));
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

	const [selectedMovie, getOfficialMovieAction, isGetMoviePending] =
		useActionState(
			async (prev: MovieInfo | null, externalApiMovieId: number | null) => {
				if (!externalApiMovieId) {
					return null;
				}

				const [officialMovieInfo, directorsInfo] = await Promise.all([
					getOfficialMovieInfo(externalApiMovieId),
					getOfficialMovieDirectorsInfo(externalApiMovieId),
				]);

				if (!officialMovieInfo.success || !directorsInfo.success) {
					return null;
				}

				const { title, release_date, runtime, poster_path, backdrop_path } =
					officialMovieInfo.data;
				const directors = directorsInfo.data;

				return {
					title: movie.title,
					url: movie.url,
					serviceSlug: movie.serviceSlug,
					serviceName: movie.serviceName,
					details: {
						officialTitle: title,
						backgroundImage: TMDB_IMAGE_BASE_URL + backdrop_path,
						posterImage: TMDB_IMAGE_BASE_URL + poster_path,
						runnningMinutes: runtime,
						releaseYear: new Date(release_date).getFullYear(),
						director: directors,
					},
				};
			},
			null,
		);

	const handleClick = (page = 1) => {
		startTransition(() => {
			searchResultAction(page);
		});
	};

	const handleSelect = (externalApiMovieId: number) => {
		startTransition(() => {
			getOfficialMovieAction(externalApiMovieId);
		});
	};

	const handleEnter = () => {};

	const handleSelectCnacel = () => {
		startTransition(() => {
			getOfficialMovieAction(null);
		});
	};

	const handleSearchCancel = () => {
		startTransition(() => {
			searchResultAction(null)
		})
	}

	return (
		<div className="w-full h-full flex justify-center">
			<div className="w-full pt-8 px-4">
				{searchResult && !selectedMovie && (
					<MovieSearchResult
						onClick={handleClick}
						onSelect={handleSelect}
						onCancel={handleSearchCancel}
						title={movie.title}
						searchResult={searchResult}
						isSearchPending={isSearchPending}
						isGetMoviePending={isGetMoviePending}
					/>
				)}

				{!searchResult && movie && (
					<MovieInfoContent
						isSearchPending={isSearchPending}
						onClick={handleClick}
						movie={movie}
					/>
				)}

				{searchResult && selectedMovie && (
					<MovieInfoContent
						isSearchPending={isSearchPending}
						onClick={handleClick}
						onEnter={handleEnter}
						onCancel={handleSelectCnacel}
						movie={selectedMovie}
					/>
				)}
			</div>
		</div>
	);
}
