import type { Result } from "@/features/shared/types/Result";
import type { ListItem } from "@/features/list/types/ListItem";
import type { ListItemRow } from "../repositories/server/listRepository";
import {
	userListItemsByListId,
	findMovieDirectorNames,
} from "../repositories/server/listRepository";

export const getUserListService = async (
	listId: number,
	userId: number,
): Promise<Result<ListItem[]>> => {
	const userListItems = await userListItemsByListId(listId, userId);

	const movieIds = userListItems
		.map((row) => row.movieId)
		.filter((id) => id !== null);

	const directors = await findMovieDirectorNames(movieIds);
	const movies: ListItem[] = userListItems.map((row) =>
		mapListItemRow(row, buildMovieDirectorMap(directors)),
	);

	return {
		success: true,
		data: movies,
	};
};

export const buildMovieDirectorMap = (
	directors: { movieId: number; directorName: string }[],
): Map<number, string[]> => {
	const map = new Map<number, string[]>();
	for (const director of directors) {
		const current = map.get(director.movieId);
		if (current) {
			current.push(director.directorName);
		} else {
			map.set(director.movieId, [director.directorName]);
		}
	}
	return map;
};

export const mapListItemRow = (
	row: ListItemRow,
	movieDirectors: Map<number, string[]>,
): ListItem => {
	const watchedState =
		row.watchedAt === null
			? { isWatched: false as const, watchedAt: null }
			: { isWatched: true as const, watchedAt: row.watchedAt };

	const base = {
		listItemId: row.listItemId,
		title: row.title,
		url: row.url,
		createdAt: row.createdAt,
		serviceSlug: row.serviceSlug,
		serviceName: row.serviceName,
		...watchedState,
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
		return base;
	}

	return {
		...base,
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
};

const getReleaseYear = (releaseDate: string) => {
	const releaseYear = new Date(releaseDate).getFullYear();

	if (Number.isNaN(releaseYear)) {
		throw Error(`releaseDate の形式が不正です: ${releaseDate}`);
	}

	return releaseYear;
};
