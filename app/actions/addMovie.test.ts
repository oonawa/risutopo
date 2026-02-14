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
import { SUPPORTED_SERVICES } from "@/app/consts";
import { addMovie } from "./addMovie";
import type { SupportedServiceSlug } from "@/app/consts";

async function expectMovieRegistered({
	title,
	slug,
	watchUrl,
	listId,
}: {
	title: string;
	slug: SupportedServiceSlug;
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

async function findMovieServiceIds({
	title,
	slug,
}: {
	title: string;
	slug: SupportedServiceSlug;
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

	expect(service).toBeDefined();

	return {
		movieId: movie.id,
		serviceId: service.id,
	};
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

	it("【モバイル】Netflix：ジュラシック・パークをリスト追加", async () => {
		const shareLink = `「 ジュラシック・パーク 」 をNetflix で今 す ぐチ ェ ッ ク\n\nhttps://www.netflix.com/jp/title/60002360?s=i&trkid=258593161&vlang=ja&trg=more`;

		await addMovie({
			listId: testListId,
			mobile: {
				shareLink,
			},
		});

		await expectMovieRegistered({
			title: "ジュラシック・パーク",
			slug: SUPPORTED_SERVICES.NETFLIX.slug,
			watchUrl:
				"https://www.netflix.com/jp/title/60002360?s=i&trkid=258593161&vlang=ja&trg=more",
			listId: testListId,
		});
	});

	it("【モバイル】U-NEXT：ジュラシック・パークをリスト追加", async () => {
		const shareLink = `「ジュラシック・パーク」をU-NEXTで視聴 https://video-share.unext.jp/video/title/SID0021132?utm_source=com.apple.UIKit.activity.CopyToPasteboard&utm_medium=social&utm_campaign=nonad-sns&rid=PM061312883`;

		await addMovie({
			listId: testListId,
			mobile: {
				shareLink,
			},
		});

		await expectMovieRegistered({
			title: "ジュラシック・パーク",
			slug: SUPPORTED_SERVICES.U_NEXT.slug,
			watchUrl:
				"https://video-share.unext.jp/video/title/SID0021132?utm_source=com.apple.UIKit.activity.CopyToPasteboard&utm_medium=social&utm_campaign=nonad-sns&rid=PM061312883",
			listId: testListId,
		});
	});

	it("【モバイル】Hulu：ジュラシック・パークをリスト追加", async () => {
		const shareLink = `Huluで「ジュラシック･パーク」を視聴中! https://www.hulu.jp/jurassic-park`;

		await addMovie({
			listId: testListId,
			mobile: {
				shareLink,
			},
		});

		await expectMovieRegistered({
			title: "ジュラシック・パーク",
			slug: SUPPORTED_SERVICES.HULU.slug,
			watchUrl: "https://www.hulu.jp/jurassic-park",
			listId: testListId,
		});
	});

	it("【モバイル】Prime Video：ジュラシック・パークをリスト追加", async () => {
		const shareLink = `やあ、ジュラシック・パーク (吹替版)を観ているよ。Prime Videoを今すぐチェックする https://watch.amazon.co.jp/detail?gti=amzn1.dv.gti.7ea9f6d9-bdc8-9b2e-97a9-c341306e36ef&territory=JP&ref_=share_ios_movie&r=web`;

		await addMovie({
			listId: testListId,
			mobile: {
				shareLink,
			},
		});

		await expectMovieRegistered({
			title: "ジュラシック・パーク",
			slug: SUPPORTED_SERVICES.PRIME_VIDEO.slug,
			watchUrl:
				"https://watch.amazon.co.jp/detail?gti=amzn1.dv.gti.7ea9f6d9-bdc8-9b2e-97a9-c341306e36ef&territory=JP&ref_=share_ios_movie&r=web",
			listId: testListId,
		});
	});

	it("【モバイル】Disney+：ダイナソーをリスト追加", async () => {
		const shareLink = `https://disneyplus.com/ja/browse/entity-fe34a97c-8f83-4c39-a08e-afc288e14d64?sharesource=iOS Disney+の「ダイナソー」がおすすめなので、チェックしてみてください。`;

		await addMovie({
			listId: testListId,
			mobile: {
				shareLink,
			},
		});

		await expectMovieRegistered({
			title: "ダイナソー",
			slug: SUPPORTED_SERVICES.DISNEY_PLUS.slug,
			watchUrl:
				"https://disneyplus.com/ja/browse/entity-fe34a97c-8f83-4c39-a08e-afc288e14d64?sharesource=iOS",
			listId: testListId,
		});
	});

	it("【PC】Netflix：ジュラシック・パークをリスト追加", async () => {
		await addMovie({
			listId: testListId,
			browser: {
				title: "ジュラシック・パーク",
				url: "https://www.netflix.com/jp/title/60002360?s=i&trkid=258593161&vlang=ja&trg=more",
			},
		});

		await expectMovieRegistered({
			title: "ジュラシック・パーク",
			slug: SUPPORTED_SERVICES.NETFLIX.slug,
			watchUrl:
				"https://www.netflix.com/jp/title/60002360?s=i&trkid=258593161&vlang=ja&trg=more",
			listId: testListId,
		});
	});

	it("【PC】U-NEXT：ジュラシック・パークをリスト追加", async () => {
		await addMovie({
			listId: testListId,
			browser: {
				title: "ジュラシック・パーク",
				url: "https://video-share.unext.jp/video/title/SID0021132?utm_source=com.apple.UIKit.activity.CopyToPasteboard&utm_medium=social&utm_campaign=nonad-sns&rid=PM061312883",
			},
		});

		await expectMovieRegistered({
			title: "ジュラシック・パーク",
			slug: SUPPORTED_SERVICES.U_NEXT.slug,
			watchUrl:
				"https://video-share.unext.jp/video/title/SID0021132?utm_source=com.apple.UIKit.activity.CopyToPasteboard&utm_medium=social&utm_campaign=nonad-sns&rid=PM061312883",
			listId: testListId,
		});
	});

	it("【PC】Hulu：ジュラシック・パークをリスト追加", async () => {
		await addMovie({
			listId: testListId,
			browser: {
				title: "ジュラシック・パーク",
				url: "https://www.hulu.jp/jurassic-park",
			},
		});

		await expectMovieRegistered({
			title: "ジュラシック・パーク",
			slug: SUPPORTED_SERVICES.HULU.slug,
			watchUrl: "https://www.hulu.jp/jurassic-park",
			listId: testListId,
		});
	});

	it("【PC】Prime Video：ジュラシック・パークをリスト追加", async () => {
		await addMovie({
			listId: testListId,
			browser: {
				title: "ジュラシック・パーク",
				url: "https://watch.amazon.co.jp/detail?gti=amzn1.dv.gti.7ea9f6d9-bdc8-9b2e-97a9-c341306e36ef&territory=JP&ref_=share_ios_movie&r=web",
			},
		});

		await expectMovieRegistered({
			title: "ジュラシック・パーク",
			slug: SUPPORTED_SERVICES.PRIME_VIDEO.slug,
			watchUrl:
				"https://watch.amazon.co.jp/detail?gti=amzn1.dv.gti.7ea9f6d9-bdc8-9b2e-97a9-c341306e36ef&territory=JP&ref_=share_ios_movie&r=web",
			listId: testListId,
		});
	});

	it("【PC】Disney+：ダイナソーをリスト追加", async () => {
		await addMovie({
			listId: testListId,
			browser: {
				title: "ダイナソー",
				url: "https://disneyplus.com/ja/browse/entity-fe34a97c-8f83-4c39-a08e-afc288e14d64?sharesource=iOS",
			},
		});

		await expectMovieRegistered({
			title: "ダイナソー",
			slug: SUPPORTED_SERVICES.DISNEY_PLUS.slug,
			watchUrl:
				"https://disneyplus.com/ja/browse/entity-fe34a97c-8f83-4c39-a08e-afc288e14d64?sharesource=iOS",
			listId: testListId,
		});
	});

	it("同一映画・同一サービスの場合、視聴URLも同一であれば何も更新しない", async () => {
		await addMovie({
			listId: testListId,
			browser: {
				title: "ジュラシック・パーク",
				url: "https://www.hulu.jp/jurassic-park",
			},
		});

		const { movieId, serviceId } = await findMovieServiceIds({
			title: "ジュラシック・パーク",
			slug: SUPPORTED_SERVICES.HULU.slug,
		});

		const movieServicesBefore = await db
			.select()
			.from(movieServicesTable)
			.where(
				and(
					eq(movieServicesTable.movieId, movieId),
					eq(movieServicesTable.streamingServiceId, serviceId),
				),
			);
		expect(movieServicesBefore).toHaveLength(1);

		const result = await addMovie({
			listId: testListId,
			browser: {
				title: "ジュラシック・パーク",
				url: "https://www.hulu.jp/jurassic-park",
			},
		});

		expect(result.success).toBe(true);

		const movieServicesAfter = await db
			.select()
			.from(movieServicesTable)
			.where(
				and(
					eq(movieServicesTable.movieId, movieId),
					eq(movieServicesTable.streamingServiceId, serviceId),
				),
			);

		expect(movieServicesAfter).toHaveLength(1);
	});

	it("同一タイトル・同一サービスで視聴URLが異なる場合、別作品としてそのまま登録する", async () => {
		await addMovie({
			listId: testListId,
			browser: {
				title: "ゴジラ",
				url: "https://video-share.unext.jp/video/title/SID0002594?utm_source=copy&utm_medium=social&utm_campaign=nonad-sns&rid=PM061312883",
			},
		});

		const { serviceId } = await findMovieServiceIds({
			title: "ゴジラ",
			slug: SUPPORTED_SERVICES.U_NEXT.slug,
		});

		const movieServicesBefore = await db
			.select()
			.from(movieServicesTable)
			.where(eq(movieServicesTable.streamingServiceId, serviceId));
		expect(movieServicesBefore).toHaveLength(1);
		expect(movieServicesBefore[0].watchUrl).toBe(
			"https://video-share.unext.jp/video/title/SID0002594?utm_source=copy&utm_medium=social&utm_campaign=nonad-sns&rid=PM061312883",
		);

		await addMovie({
			listId: testListId,
			browser: {
				title: "ゴジラ",
				url: "https://video-share.unext.jp/video/title/SID0011145?utm_source=copy&utm_medium=social&utm_campaign=nonad-sns&rid=PM061312883",
			},
		});

		const movies = await db
			.select()
			.from(moviesTable)
			.where(eq(moviesTable.title, "ゴジラ"));

		expect(movies).toHaveLength(2);

		const movieServicesAfter = await db
			.select({
				id: movieServicesTable.id,
				watchUrl: movieServicesTable.watchUrl,
			})
			.from(movieServicesTable)
			.innerJoin(moviesTable, eq(movieServicesTable.movieId, moviesTable.id))
			.where(
				and(
					eq(moviesTable.title, "ゴジラ"),
					eq(movieServicesTable.streamingServiceId, serviceId),
				),
			);

		expect(movieServicesAfter).toHaveLength(2);

		const watchUrls = movieServicesAfter.map((service) => service.watchUrl);
		expect(watchUrls).toEqual(
			expect.arrayContaining([
				"https://video-share.unext.jp/video/title/SID0002594?utm_source=copy&utm_medium=social&utm_campaign=nonad-sns&rid=PM061312883",
				"https://video-share.unext.jp/video/title/SID0011145?utm_source=copy&utm_medium=social&utm_campaign=nonad-sns&rid=PM061312883",
			]),
		);

		const listMoviesAfter = await db
			.select()
			.from(listMoviesTable)
			.where(eq(listMoviesTable.listId, testListId));
		expect(listMoviesAfter).toHaveLength(2);
	});
});
