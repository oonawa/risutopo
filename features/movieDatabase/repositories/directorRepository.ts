import { eq, inArray } from "drizzle-orm";

import { db } from "@/db/client";
import {
	directorCacheTable,
	directorsTable,
	movieDirectorsTable,
	moviesTable,
} from "@/db/schema";

/**
 * キャッシュが有効な場合は監督名の配列を返す。
 * キャッシュなし・期限切れ・監督未登録の場合は null を返す。
 */
export async function findCachedDirectors(
	externalDatabaseMovieId: string,
	cacheThreshold: Date,
): Promise<string[] | null> {
	const cachedDirectors = await db
		.select({
			name: directorsTable.name,
			cachedAt: directorCacheTable.cachedAt,
		})
		.from(moviesTable)
		.innerJoin(
			directorCacheTable,
			eq(directorCacheTable.movieId, moviesTable.id),
		)
		.innerJoin(
			movieDirectorsTable,
			eq(movieDirectorsTable.movieId, moviesTable.id),
		)
		.innerJoin(
			directorsTable,
			eq(movieDirectorsTable.directorId, directorsTable.id),
		)
		.where(eq(moviesTable.externalDatabaseMovieId, externalDatabaseMovieId));

	if (
		cachedDirectors.length > 0 &&
		cachedDirectors.every((director) => director.cachedAt >= cacheThreshold)
	) {
		return cachedDirectors.map((director) => director.name);
	}

	return null;
}

export async function upsertDirectorsWithCache(
	movieId: number,
	directors: string[],
	cachedAt: Date,
): Promise<void> {
	await db.transaction(async (tx) => {
		// 既存の監督を一括取得
		const existingDirectors = await tx
			.select({ id: directorsTable.id, name: directorsTable.name })
			.from(directorsTable)
			.where(inArray(directorsTable.name, directors));

		const existingNames = new Set(existingDirectors.map((d) => d.name));
		const missingNames = directors.filter((name) => !existingNames.has(name));

		// 新規監督を一括挿入
		const insertedDirectors =
			missingNames.length > 0
				? await tx
						.insert(directorsTable)
						.values(missingNames.map((name) => ({ name })))
						.returning({ id: directorsTable.id, name: directorsTable.name })
				: [];

		// movie_directors を一括挿入
		const allDirectors = [...existingDirectors, ...insertedDirectors];
		await tx
			.insert(movieDirectorsTable)
			.values(allDirectors.map((d) => ({ movieId, directorId: d.id })))
			.onConflictDoNothing();

		// キャッシュを更新
		await tx
			.insert(directorCacheTable)
			.values({ movieId, cachedAt })
			.onConflictDoUpdate({
				target: directorCacheTable.movieId,
				set: { cachedAt },
			});
	});
}
