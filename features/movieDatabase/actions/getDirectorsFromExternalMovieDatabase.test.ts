import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { db } from "@/db/client";
import {
	directorCacheTable,
	directorsTable,
	movieDirectorsTable,
	moviesTable,
} from "@/db/schema";
import { getDirectorsFromExternalMovieDatabase } from "./getDirectorsFromExternalMovieDatabase";

const EXTERNAL_MOVIE_ID = 329;

const mockCreditsResponse = {
	crew: [
		{ name: "スティーヴン・スピルバーグ", job: "Director" },
		{ name: "John Williams", job: "Original Music Composer" },
	],
};

async function seedMovie() {
	const [movie] = await db
		.insert(moviesTable)
		.values({
			externalDatabaseMovieId: EXTERNAL_MOVIE_ID.toString(),
			title: "ジュラシック・パーク",
			backgroundImage: "https://image.tmdb.org/t/p/original/bg.jpg",
			posterImage: "https://image.tmdb.org/t/p/original/poster.jpg",
			runningMinutes: 127,
			releaseDate: "1993-06-11",
			overview: "恐竜が復活したテーマパーク。",
		})
		.returning({ id: moviesTable.id });
	return movie;
}

describe("getDirectorsFromExternalMovieDatabase", () => {
	beforeEach(() => {
		process.env.TMDB_API_KEY = "test-api-key";
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.useRealTimers();
		delete process.env.TMDB_API_KEY;
	});

	it("キャッシュヒット時はDBから監督情報を返す（fetch呼び出しなし）", async () => {
		const seededMovie = await seedMovie();

		const [seededDirector] = await db
			.insert(directorsTable)
			.values({ name: "スティーヴン・スピルバーグ" })
			.returning({ id: directorsTable.id });

		await db.insert(movieDirectorsTable).values({
			movieId: seededMovie.id,
			directorId: seededDirector.id,
		});

		await db.insert(directorCacheTable).values({
			movieId: seededMovie.id,
			cachedAt: new Date(),
		});

		const fetchMock = vi.spyOn(global, "fetch");
		const result =
			await getDirectorsFromExternalMovieDatabase(EXTERNAL_MOVIE_ID);

		expect(result.success).toBe(true);
		if (!result.success) return;
		expect(result.data).toEqual(["スティーヴン・スピルバーグ"]);
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("キャッシュなし時はAPIを呼び出してDBに保存し監督名を返す", async () => {
		const seededMovie = await seedMovie();

		vi.spyOn(global, "fetch").mockResolvedValueOnce(
			new Response(JSON.stringify(mockCreditsResponse), { status: 200 }),
		);

		const result =
			await getDirectorsFromExternalMovieDatabase(EXTERNAL_MOVIE_ID);

		expect(result.success).toBe(true);
		if (!result.success) return;
		expect(result.data).toEqual(["スティーヴン・スピルバーグ"]);

		const [directorRecord] = await db
			.select()
			.from(directorsTable)
			.where(eq(directorsTable.name, "スティーヴン・スピルバーグ"));
		expect(directorRecord).toBeDefined();

		const [cacheRecord] = await db
			.select()
			.from(directorCacheTable)
			.where(eq(directorCacheTable.movieId, seededMovie.id));
		expect(cacheRecord).toBeDefined();
	});

	it("ネットワークエラーが発生した場合はNETWORK_ERRORを返す", async () => {
		vi.useFakeTimers();
		vi.spyOn(global, "fetch").mockRejectedValue(new Error("Network error"));

		const resultPromise =
			getDirectorsFromExternalMovieDatabase(EXTERNAL_MOVIE_ID);
		await vi.runAllTimersAsync();
		const result = await resultPromise;

		expect(result).toEqual({
			success: false,
			error: { code: "NETWORK_ERROR", message: expect.any(String) },
		});
	});

	it("タイムアウト時はNETWORK_ERRORを返す", async () => {
		vi.useFakeTimers();
		vi.spyOn(global, "fetch").mockRejectedValue(
			new DOMException("The operation was aborted.", "AbortError"),
		);

		const resultPromise =
			getDirectorsFromExternalMovieDatabase(EXTERNAL_MOVIE_ID);
		await vi.runAllTimersAsync();
		const result = await resultPromise;

		expect(result).toEqual({
			success: false,
			error: { code: "NETWORK_ERROR", message: expect.any(String) },
		});
	});

	it("5xxエラーが続いた場合はリトライしてNETWORK_ERRORを返す", async () => {
		vi.useFakeTimers();
		const fetchMock = vi
			.spyOn(global, "fetch")
			.mockResolvedValue(new Response(null, { status: 500 }));

		const resultPromise =
			getDirectorsFromExternalMovieDatabase(EXTERNAL_MOVIE_ID);
		await vi.runAllTimersAsync();
		const result = await resultPromise;

		expect(result).toEqual({
			success: false,
			error: { code: "NETWORK_ERROR", message: expect.any(String) },
		});
		expect(fetchMock).toHaveBeenCalledTimes(3); // 初回 + 2リトライ
	});

	it("5xxエラー後のリトライで成功した場合は結果を返す", async () => {
		vi.useFakeTimers();
		vi.spyOn(global, "fetch")
			.mockResolvedValueOnce(new Response(null, { status: 500 }))
			.mockResolvedValueOnce(
				new Response(JSON.stringify(mockCreditsResponse), { status: 200 }),
			);

		const resultPromise =
			getDirectorsFromExternalMovieDatabase(EXTERNAL_MOVIE_ID);
		await vi.runAllTimersAsync();
		const result = await resultPromise;

		expect(result.success).toBe(true);
		if (!result.success) return;
		expect(result.data).toEqual(["スティーヴン・スピルバーグ"]);
	});

	it("4xxエラーの場合はリトライせずINTERNAL_ERRORを返す", async () => {
		const fetchMock = vi
			.spyOn(global, "fetch")
			.mockResolvedValueOnce(new Response(null, { status: 404 }));

		const result =
			await getDirectorsFromExternalMovieDatabase(EXTERNAL_MOVIE_ID);

		expect(result).toEqual({
			success: false,
			error: { code: "INTERNAL_ERROR", message: expect.any(String) },
		});
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});

	it("429エラーの場合はリトライせずTOO_MANY_REQUESTS_ERRORを返す", async () => {
		const fetchMock = vi
			.spyOn(global, "fetch")
			.mockResolvedValueOnce(new Response(null, { status: 429 }));

		const result =
			await getDirectorsFromExternalMovieDatabase(EXTERNAL_MOVIE_ID);

		expect(result).toEqual({
			success: false,
			error: { code: "TOO_MANY_REQUESTS_ERROR", message: expect.any(String) },
		});
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});
});
