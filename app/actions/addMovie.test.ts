import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/db/client";
import { eq, and } from "drizzle-orm";
import {
	usersTable,
	listsTable,
	moviesTable,
	movieServicesTable,
	listMoviesTable,
	streamingServicesTable,
} from "@/db/schema";
import { addMovie } from "./addMovie";

async function expectMovieRegistered({
	title,
	slug,
	watchUrl,
	listId,
}: {
	title: string;
	slug: string;
	watchUrl: string;
	listId: number;
}) {
	const [movie] = await db
		.select()
		.from(moviesTable)
		.where(eq(moviesTable.title, title));

	expect(movie).toBeDefined();

	const [service] = await db
		.select()
		.from(streamingServicesTable)
		.where(eq(streamingServicesTable.slug, slug));

	const [movieService] = await db
		.select()
		.from(movieServicesTable)
		.where(
			and(
				eq(movieServicesTable.movieId, movie.id),
				eq(movieServicesTable.streamingServiceId, service.id),
			),
		);

	expect(movieService.watchUrl).toBe(watchUrl);

	const listMovies = await db
		.select()
		.from(listMoviesTable)
		.where(
			and(
				eq(listMoviesTable.listId, listId),
				eq(listMoviesTable.movieServiceId, movieService.id),
			),
		);

	expect(listMovies).toHaveLength(1);
}

describe("addMovie", () => {
	let testUserId: number;
	let testListId: number;

	beforeEach(async () => {
		const [user] = await db
			.insert(usersTable)
			.values({
				publicId: "test",
				email: "xxxxxxx@risutopo.com",
			})
			.returning();
		testUserId = user.id;

		const [list] = await db
			.insert(listsTable)
			.values({ userId: testUserId })
			.returning();
		testListId = list.id;
	});

	it("Netflix：ジュラシック・パークをリスト追加", async () => {
		const shareLink = `「 ジュラシック・パーク 」 をNetflix で今 す ぐチ ェ ッ ク\n\nhttps://www.netflix.com/jp/title/60002360?s=i&trkid=258593161&vlang=ja&trg=more`;

		await addMovie(shareLink, testListId);

		await expectMovieRegistered({
			title: "ジュラシック・パーク",
			slug: "netflix",
			watchUrl:
				"https://www.netflix.com/jp/title/60002360?s=i&trkid=258593161&vlang=ja&trg=more",
			listId: testListId,
		});
	});

	it("U-NEXT：ジュラシック・パークをリスト追加", async () => {
		const shareLink = `「ジュラシック・パーク」をU-NEXTで視聴 https://video-share.unext.jp/video/title/SID0021132?utm_source=com.apple.UIKit.activity.CopyToPasteboard&utm_medium=social&utm_campaign=nonad-sns&rid=PM061312883`;

		await addMovie(shareLink, testListId);

		await expectMovieRegistered({
			title: "ジュラシック・パーク",
			slug: "unext",
			watchUrl:
				"https://video-share.unext.jp/video/title/SID0021132?utm_source=com.apple.UIKit.activity.CopyToPasteboard&utm_medium=social&utm_campaign=nonad-sns&rid=PM061312883",
			listId: testListId,
		});
	});

	it("Hulu：ジュラシック・パークをリスト追加", async () => {
		const shareLink = `Huluで「ジュラシック･パーク」を視聴中! https://www.hulu.jp/jurassic-park`;

		await addMovie(shareLink, testListId);

		await expectMovieRegistered({
			title: "ジュラシック・パーク",
			slug: "hulu",
			watchUrl: "https://www.hulu.jp/jurassic-park",
			listId: testListId,
		});
	});

	it("Prime Video：ジュラシック・パークをリスト追加", async () => {
		const shareLink = `やあ、ジュラシック・パーク (吹替版)を観ているよ。Prime Videoを今すぐチェックする https://watch.amazon.co.jp/detail?gti=amzn1.dv.gti.7ea9f6d9-bdc8-9b2e-97a9-c341306e36ef&territory=JP&ref_=share_ios_movie&r=web`;

		await addMovie(shareLink, testListId);

		await expectMovieRegistered({
			title: "ジュラシック・パーク",
			slug: "prime-video",
			watchUrl:
				"https://watch.amazon.co.jp/detail?gti=amzn1.dv.gti.7ea9f6d9-bdc8-9b2e-97a9-c341306e36ef&territory=JP&ref_=share_ios_movie&r=web",
			listId: testListId,
		});
	});

	it("Disney+：ダイナソーをリスト追加", async () => {
		const shareLink = `https://disneyplus.com/ja/browse/entity-fe34a97c-8f83-4c39-a08e-afc288e14d64?sharesource=iOS Disney+の「ダイナソー」がおすすめなので、チェックしてみてください。`;

		await addMovie(shareLink, testListId);

		await expectMovieRegistered({
			title: "ダイナソー",
			slug: "disney-plus",
			watchUrl:
				"https://disneyplus.com/ja/browse/entity-fe34a97c-8f83-4c39-a08e-afc288e14d64?sharesource=iOS",
			listId: testListId,
		});
	});
});
