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
		if (
			row.movieId === null ||
			row.officialTitle === null ||
			row.backgroundImage === null ||
			row.posterImage === null ||
			row.runningMinutes === null ||
			row.releaseYear === null ||
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
				isWatched: row.watchStatus === 1,
			};
		}

		return {
			listItemId: row.listItemId,
			title: row.title,
			url: row.url,
			createdAt: row.createdAt,
			serviceSlug: row.serviceSlug,
			serviceName: row.serviceName,
			isWatched: row.watchStatus === 1,
			details: {
				movieId: row.movieId,
				officialTitle: row.officialTitle,
				backgroundImage: row.backgroundImage,
				posterImage: row.posterImage,
				director: movieDirectors.get(row.movieId) ?? [],
				runningMinutes: row.runningMinutes,
				releaseYear: row.releaseYear,
				externalDatabaseMovieId: Number(row.externalDatabaseMovieId),
				overview: row.overview,
			},
		};
	});
};
