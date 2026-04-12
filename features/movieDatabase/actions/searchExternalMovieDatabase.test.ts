import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { TmdbSearchResponse } from "../types/TmdbResponse";
import { searchExternalMovieDatabase } from "./searchExternalMovieDatabase";

const mockSearchResponse: TmdbSearchResponse = {
	page: 1,
	results: [
		{
			id: 329,
			title: "ジュラシック・パーク",
			poster_path: "/qIm2nHXLpBBdMxi8dvfrnDkBUDh.jpg",
			backdrop_path: "/njFixYzIxX8jsn6KMSEtAzi4avi.jpg",
			overview: "恐竜が復活したテーマパーク。",
			release_date: "1993-06-11",
			runtime: 127,
		},
	],
	total_pages: 1,
	total_results: 1,
};

describe("searchExternalMovieDatabase", () => {
	beforeEach(() => {
		process.env.TMDB_API_KEY = "test-api-key";
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.useRealTimers();
		delete process.env.TMDB_API_KEY;
	});

	it("タイトルで映画を検索できる", async () => {
		vi.spyOn(global, "fetch").mockResolvedValueOnce(
			new Response(JSON.stringify(mockSearchResponse), { status: 200 }),
		);

		const result = await searchExternalMovieDatabase("ジュラシック・パーク");

		expect(result.success).toBe(true);
		if (!result.success) return;
		expect(result.data).toEqual(mockSearchResponse);
	});

	it("ネットワークエラーが発生した場合はNETWORK_ERRORを返す", async () => {
		vi.useFakeTimers();
		vi.spyOn(global, "fetch").mockRejectedValue(new Error("Network error"));

		const resultPromise = searchExternalMovieDatabase("テスト");
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

		const resultPromise = searchExternalMovieDatabase("テスト");
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

		const resultPromise = searchExternalMovieDatabase("テスト");
		await vi.runAllTimersAsync();
		const result = await resultPromise;

		expect(result).toEqual({
			success: false,
			error: { code: "NETWORK_ERROR", message: expect.any(String) },
		});
		expect(fetchMock).toHaveBeenCalledTimes(2); // 初回 + 1リトライ
	});

	it("5xxエラー後のリトライで成功した場合は結果を返す", async () => {
		vi.useFakeTimers();
		const fetchMock = vi
			.spyOn(global, "fetch")
			.mockResolvedValueOnce(new Response(null, { status: 500 }))
			.mockResolvedValueOnce(
				new Response(JSON.stringify(mockSearchResponse), { status: 200 }),
			);

		const resultPromise = searchExternalMovieDatabase("ジュラシック・パーク");
		await vi.runAllTimersAsync();
		const result = await resultPromise;

		expect(result.success).toBe(true);
		if (!result.success) return;
		expect(result.data).toEqual(mockSearchResponse);
		expect(fetchMock).toHaveBeenCalledTimes(2);
	});

	it("4xxエラーの場合はリトライせずINTERNAL_ERRORを返す", async () => {
		const fetchMock = vi
			.spyOn(global, "fetch")
			.mockResolvedValueOnce(new Response(null, { status: 404 }));

		const result = await searchExternalMovieDatabase("テスト");

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

		const result = await searchExternalMovieDatabase("テスト");

		expect(result).toEqual({
			success: false,
			error: { code: "TOO_MANY_REQUESTS_ERROR", message: expect.any(String) },
		});
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});
});
