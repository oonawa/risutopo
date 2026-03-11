import type { Result } from "@/features/shared/types/Result";
import type { ListItem } from "@/features/list/types/ListItem";
import {
	findDirectorRowsByMovieIds,
	findListItemRowsByListPublicId,
	findListPublicIdByUserId,
} from "@/features/list/repositories/server/listRepository";

export async function getUserMovieList(
	listPublicId: string,
	userId: number,
): Promise<Result<ListItem[]>> {
	const currentUserListPublicId = await findListPublicIdByUserId(userId);

	if (currentUserListPublicId !== listPublicId) {
		return {
			success: false,
			error: {
				code: "FORBIDDEN_ERROR",
				message: "",
			},
		};
	}

	const rows = await findListItemRowsByListPublicId(listPublicId);

	const movieIds = rows
		.flatMap((row) => {
			return row.movieId === null ? [] : [row.movieId];
		})
		.filter((movieId, index, allMovieIds) => {
			return allMovieIds.indexOf(movieId) === index;
		});

	const directorRows = await findDirectorRowsByMovieIds(movieIds);
	const directorsByMovieId = new Map<number, string[]>();

	for (const row of directorRows) {
		const current = directorsByMovieId.get(row.movieId);
		if (current) {
			current.push(row.directorName);
			continue;
		}

		directorsByMovieId.set(row.movieId, [row.directorName]);
	}

	const movies: ListItem[] = rows.map((row) => {
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

		const externalDatabaseMovieId = Number(row.externalDatabaseMovieId);
		const safeExternalDatabaseMovieId = Number.isNaN(externalDatabaseMovieId)
			? row.movieId
			: externalDatabaseMovieId;

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
				director: directorsByMovieId.get(row.movieId) ?? [],
				runningMinutes: row.runningMinutes,
				releaseYear: row.releaseYear,
				externalDatabaseMovieId: safeExternalDatabaseMovieId,
				overview: row.overview,
			},
		};
	});

	return {
		success: true,
		data: movies,
	};
}

export async function getUserMovieListPublicId(
	userId: number,
): Promise<string | null> {
	return await findListPublicIdByUserId(userId);
}
