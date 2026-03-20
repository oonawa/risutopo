import type { Result } from "@/features/shared/types/Result";
import type { ListItem } from "@/features/list/types/ListItem";
import type { ListItemRow } from "../repositories/server/listRepository";
import {
	findUserListItems,
	findMovieDirectorNames,
} from "../repositories/server/listRepository";

export const getUserListService = async (
	listPublicId: string,
	userId: number,
): Promise<Result<ListItem[]>> => {
	const userListItems = await findUserListItems(listPublicId, userId);

	if (userListItems.length === 0) {
		return {
			success: false,
			error: {
				code: "NOT_FOUND_ERROR",
				message: "リストが見つかりませんでした。",
			},
		};
	}

	const movieIds = userListItems
		.map((row) => row.movieId)
		.filter((id) => id !== null);

	const directors = await findMovieDirectorNames(movieIds);
	const movies: ListItem[] = mapListItems(userListItems, mapMovieDirector(directors));

	return {
		success: true,
		data: movies,
	};
};

const mapMovieDirector = (
	directors: {
		movieId: number;
		directorName: string;
	}[],
) => {
	const movieDirectors = new Map<number, string[]>();

	for (const director of directors) {
		const current = movieDirectors.get(director.movieId);
		if (current) {
			current.push(director.directorName);
			continue;
		}

		movieDirectors.set(director.movieId, [director.directorName]);
	}
	return movieDirectors;
};

const mapListItems = (
	rows: ListItemRow[],
	movieDirectors: Map<number, string[]>,
) => {
	return rows.map((row) => {
		const watchedState =
			row.watchedAt === null
				? {
						isWatched: false as const,
						watchedAt: null,
					}
				: {
						isWatched: true as const,
						watchedAt: row.watchedAt,
					};

		if (
			row.movieId === null ||
			row.officialTitle === null ||
			row.backgroundImage === null ||
			row.posterImage === null ||
			row.runningMinutes === null ||
			row.releaseDate === null ||
			row.overview === null ||
			row.externalDatabaseMovieId === null
		) {
			return {
				listItemId: row.listItemId,
				title: row.title,
				url: row.url,
				createdAt: row.createdAt,
				serviceSlug: row.serviceSlug,
				serviceName: row.serviceName,
				...watchedState,
			};
		}

		return {
			listItemId: row.listItemId,
			title: row.title,
			url: row.url,
			createdAt: row.createdAt,
			serviceSlug: row.serviceSlug,
			serviceName: row.serviceName,
			...watchedState,
			details: {
				movieId: row.movieId,
				officialTitle: row.officialTitle,
				backgroundImage: row.backgroundImage,
				posterImage: row.posterImage,
				director: movieDirectors.get(row.movieId) ?? [],
				runningMinutes: row.runningMinutes,
				releaseYear: getReleaseYear(row.releaseDate),
				externalDatabaseMovieId: Number(row.externalDatabaseMovieId),
				overview: row.overview,
			},
		};
	});
};

const getReleaseYear = (releaseDate: string) => {
	const releaseYear = new Date(releaseDate).getFullYear();

	if (Number.isNaN(releaseYear)) {
		throw Error(`releaseDate の形式が不正です: ${releaseDate}`);
	}

	return releaseYear;
};
