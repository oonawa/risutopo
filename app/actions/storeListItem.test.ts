import { and, eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/db/client";
import {
	directorsTable,
	listItemsTable,
	listsTable,
	movieDirectorsTable,
	moviesTable,
	streamingServicesTable,
	usersTable,
} from "@/db/schema";
import type { MovieInfo } from "../types/MovieInputForm/MovieInfo";
import { TMDB_IMAGE_BASE_URL } from "../consts";
import { storeListItem } from "./storeListItem";

async function assertStoreMovieResult({
	listId,
	movie,
	expectedTitle,
	isWatched = false,
}: {
	listId: number;
	movie: MovieInfo;
	expectedTitle: string;
	isWatched?: boolean;
}) {
	const result = await storeListItem({
		listId,
		movie,
		isWatched,
		now: new Date(),
	});

	expect(result.success).toBe(true);
	if (!result.success) {
		return null;
	}

	expect(result.data.listItemId).toBeDefined();
	expect(result.data.title).toBe(expectedTitle);
	expect(result.data.url).toBe(movie.url);
	expect(result.data.serviceSlug).toBe(movie.serviceSlug);
	expect(result.data.serviceName).toBe(movie.serviceName);
	expect(result.data.isWatched).toBe(isWatched);
	expect(result.data.details).toEqual(movie.details);
	return result.data;
}

async function assertMoviesTableHasNoRecords() {
	const movies = await db.select({ id: moviesTable.id }).from(moviesTable);
	expect(movies).toHaveLength(0);
}

async function assertDirectorsTableHasNoRecords() {
	try {
		const directors = await db
			.select({ id: directorsTable.id })
			.from(directorsTable);
		expect(directors).toHaveLength(0);
	} catch (error: unknown) {
		expect(error).toBeInstanceOf(Error);

		if (!(error instanceof Error)) {
			return;
		}

		expect(error.message).toContain('select "id" from "directors_table"');

		if (error.cause instanceof Error) {
			expect(error.cause.message).toContain("no such table: directors_table");
		}
	}
}

async function getStreamingServiceIdBySlug(
	serviceSlug: MovieInfo["serviceSlug"],
) {
	const [service] = await db
		.select({ id: streamingServicesTable.id })
		.from(streamingServicesTable)
		.where(eq(streamingServicesTable.slug, serviceSlug));

	expect(service).toBeDefined();

	if (!service) {
		throw Error(`streaming_services_table に ${serviceSlug} が存在しません`);
	}

	return service.id;
}

async function assertListItemRecord({
	testListId,
	streamingServiceId,
	movie,
	expectedMovieId,
	expectedTitleOnService,
}: {
	testListId: number;
	streamingServiceId: number;
	movie: MovieInfo;
	expectedMovieId: number | null;
	expectedTitleOnService: string;
}) {
	const [listItemRecord] = await db
		.select()
		.from(listItemsTable)
		.where(
			and(
				eq(listItemsTable.listId, testListId),
				eq(listItemsTable.streamingServiceId, streamingServiceId),
				eq(listItemsTable.watchUrl, movie.url),
				eq(listItemsTable.titleOnService, expectedTitleOnService),
			),
		);

	expect(listItemRecord).toBeDefined();

	if (!listItemRecord) {
		return null;
	}

	expect(listItemRecord.movieId).toBe(expectedMovieId);
	return listItemRecord.id;
}

async function assertMovieRecordFromTmdbDetails(movie: MovieInfo) {
	if (!movie.details) {
		throw Error("TMDBありケースのため movie.details が必要です");
	}

	const [movieRecord] = await db
		.select()
		.from(moviesTable)
		.where(
			and(
				eq(
					moviesTable.externalDatabaseMovieId,
					movie.details.externalDatabaseMovieId.toString(),
				),
				eq(moviesTable.title, movie.details.officialTitle),
				eq(moviesTable.backgroundImage, movie.details.backgroundImage),
				eq(moviesTable.posterImage, movie.details.posterImage),
				eq(moviesTable.runnningMinutes, movie.details.runnningMinutes),
				eq(moviesTable.releaseYear, movie.details.releaseYear),
			),
		);

	expect(movieRecord).toBeDefined();

	if (!movieRecord) {
		throw Error("movies_table にTMDB由来のレコードが作成されていません");
	}

	expect(movieRecord.cachedAt).toBeInstanceOf(Date);
	return movieRecord;
}

async function assertDirectorRecordFromTmdbDetails(movie: MovieInfo) {
	if (!movie.details) {
		throw Error("TMDBありケースのため movie.details が必要です");
	}

	const [directorName] = movie.details.director;
	expect(directorName).toBeDefined();

	if (!directorName) {
		throw Error("movie.details.director[0] が必要です");
	}

	const [directorRecord] = await db
		.select()
		.from(directorsTable)
		.where(eq(directorsTable.name, directorName));

	expect(directorRecord).toBeDefined();

	if (!directorRecord) {
		throw Error("directors_table に監督レコードが作成されていません");
	}

	expect(directorRecord.cachedAt).toBeInstanceOf(Date);
	return directorRecord;
}

async function assertMovieDirectorRecord({
	movieId,
	directorId,
}: {
	movieId: number;
	directorId: number;
}) {
	const [movieDirectorRecord] = await db
		.select()
		.from(movieDirectorsTable)
		.where(
			and(
				eq(movieDirectorsTable.movieId, movieId),
				eq(movieDirectorsTable.directorId, directorId),
			),
		);

	expect(movieDirectorRecord).toBeDefined();
}

describe("storeMovie", () => {
	let testListId: number;

	beforeEach(async () => {
		const [user] = await db
			.insert(usersTable)
			.values({
				publicId: "test",
				email: "xxxxxxx@risutopo.com",
			})
			.returning();

		const [list] = await db
			.insert(listsTable)
			.values({ userId: user.id })
			.returning();
		testListId = list.id;
	});

	it("【TMDBなし】Netflix：ジュラシック・パークをリスト追加", async () => {
		const movie: MovieInfo = {
			title: "ジュラシック・パーク",
			url: "https://www.netflix.com/jp/title/60002360?s=i&trkid=258593161&vlang=ja&trg=more",
			serviceSlug: "netflix",
			serviceName: "Netflix",
			createdAt: new Date(),
		};

		const storeResult = await assertStoreMovieResult({
			listId: testListId,
			movie,
			expectedTitle: movie.title,
		});
		expect(storeResult).not.toBeNull();
		await assertMoviesTableHasNoRecords();
		await assertDirectorsTableHasNoRecords();

		const netflixStreamingServiceId = await getStreamingServiceIdBySlug(
			movie.serviceSlug,
		);

		const listItemId = await assertListItemRecord({
			testListId,
			streamingServiceId: netflixStreamingServiceId,
			movie,
			expectedMovieId: null,
			expectedTitleOnService: movie.title,
		});
		if (!listItemId) {
			throw Error("list_items_table へのレコード登録に失敗しています");
		}
	});

	it("【TMDBあり】Prime Video：ジュラシック・パークをリスト追加", async () => {
		const tmdbMovieDetails = {
			backgroundImage: `${TMDB_IMAGE_BASE_URL}/njFixYzIxX8jsn6KMSEtAzi4avi.jpg`,
			posterImage: `${TMDB_IMAGE_BASE_URL}/qIm2nHXLpBBdMxi8dvfrnDkBUDh.jpg`,
			officialTitle: "ジュラシック・パーク",
			runnningMinutes: 127,
			releaseYear: 1993,
			director: ["スティーヴン・スピルバーグ"],
			externalDatabaseMovieId: 329,
			overview:
				"大富豪ジョン・ハモンドの招待で、古生物学者グラントとサトラー、そして数学者マルコムが南米コスタリカの沖合いに浮かぶ島を訪れた。そこは太古の琥珀に閉じ込められたDNAから遺伝子工学によって蘇った恐竜たちが生息する究極のアミューズメント・パークだったのだ。だがオープンを控えたその“ジュラシック・パーク”に次々とトラブルが襲いかかる。嵐の迫る中、ついに檻から解き放たれた恐竜たちは一斉に人間に牙を剥き始めた。",
		};

		const [seededMovie] = await db
			.insert(moviesTable)
			.values({
				externalDatabaseMovieId:
					tmdbMovieDetails.externalDatabaseMovieId.toString(),
				title: tmdbMovieDetails.officialTitle,
				backgroundImage: tmdbMovieDetails.backgroundImage,
				posterImage: tmdbMovieDetails.posterImage,
				runnningMinutes: tmdbMovieDetails.runnningMinutes,
				releaseDate: "1993-06-11",
				releaseYear: tmdbMovieDetails.releaseYear,
				cachedAt: new Date(),
				overview: tmdbMovieDetails.overview,
			})
			.returning({ id: moviesTable.id });

		const [seededDirector] = await db
			.insert(directorsTable)
			.values({
				name: tmdbMovieDetails.director[0],
				cachedAt: new Date(),
			})
			.returning({ id: directorsTable.id });

		await db.insert(movieDirectorsTable).values({
			movieId: seededMovie.id,
			directorId: seededDirector.id,
		});

		const movie: MovieInfo = {
			title: "ジュラシック・パーク (吹替版)",
			url: "https://watch.amazon.co.jp/detail?gti=amzn1.dv.gti.7ea9f6d9-bdc8-9b2e-97a9-c341306e36ef&territory=JP&ref_=share_ios_movie&r=web",
			serviceSlug: "prime-video",
			serviceName: "Prime Video",
			createdAt: new Date(),
			details: {
				movieId: seededMovie.id,
				...tmdbMovieDetails,
			},
		};

		const storeResult = await assertStoreMovieResult({
			listId: testListId,
			movie,
			expectedTitle: movie.title,
		});
		expect(storeResult).not.toBeNull();
		const details = movie.details;
		if (!details) {
			throw Error("TMDBありケースのため movie.details が必要です");
		}

		const movieRecord = await assertMovieRecordFromTmdbDetails(movie);
		const directorRecord = await assertDirectorRecordFromTmdbDetails(movie);
		await assertMovieDirectorRecord({
			movieId: movieRecord.id,
			directorId: directorRecord.id,
		});

		const streamingServiceId = await getStreamingServiceIdBySlug(
			movie.serviceSlug,
		);
		await assertListItemRecord({
			testListId,
			streamingServiceId,
			movie,
			expectedMovieId: movieRecord.id,
			expectedTitleOnService: movie.title,
		});
	});
});
