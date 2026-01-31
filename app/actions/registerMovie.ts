"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { moviesTable, streamingServicesTable } from "@/db/schema";

type ActionResult = {
	success: boolean;
	message: string;
	data?: {
		title: string;
		watchUrl: string;
	} | null;
};

// TODO：本当にuseActionStateが使用するAPIとして正しいか再検討
// TODO：DB登録ではなくリスト登録へ実装を修正（テスト駆動で開発）
export async function registerMovie(
	prevState: ActionResult,
	formData: FormData,
): Promise<ActionResult> {
	try {
		const text = formData.get("text");

		// TODO：バリデーションをZodへ変更する
		if (!text || typeof text !== "string") {
			return {
				success: false,
				message: "テキストを入力してください",
			};
		}

		const watchUrl = extractUrl(text);
		if (!watchUrl) {
			return {
				success: false,
				message: "URLが見つかりませんでした",
			};
		}

		const streamingServiceSlug = detectStreamingServiceSlug(watchUrl);
		if (!streamingServiceSlug) {
			return {
				success: false,
				message: "対応していない配信サービスです",
			};
		}

		const title = await extractMovieTitleFromText(text);
		if (!title) {
			return {
				success: false,
				message: "作品タイトルの取得に失敗しました",
			};
		}

		// DB登録
		await insertMovie({
			title,
			watchUrl,
			streamingServiceSlug,
		});

		return {
			success: true,
			message: "作品を登録しました",
			data: { title, watchUrl },
		};
	} catch (error) {
		console.error("registerMovie error:", error);

		return {
			success: false,
			message:
				error instanceof Error
					? error.message
					: "予期しないエラーが発生しました",
		};
	}
}

const detectStreamingServiceSlug = (url: string): string | null => {
	if (/unext\.jp/i.test(url)) return "unext";
	if (/netflix\.com/i.test(url)) return "netflix";
	if (/hulu\.jp/i.test(url)) return "hulu";
	if (/disneyplus\.com/i.test(url)) return "disney-plus";
	if (/(primevideo\.com|amazon\.co\.jp\/gp\/video)/i.test(url))
		return "prime-video";

	return null;
};

const getStreamingServiceIdBySlug = async (
	slug: string,
): Promise<number | null> => {
	const rows = await db
		.select({ id: streamingServicesTable.id })
		.from(streamingServicesTable)
		.where(eq(streamingServicesTable.slug, slug));

	return rows[0]?.id ?? null;
};

type InsertMovieInput = {
	title: string;
	watchUrl: string;
	streamingServiceSlug: string;
};

const insertMovie = async ({
	title,
	watchUrl,
	streamingServiceSlug,
}: InsertMovieInput) => {
	const streamingServiceId =
		await getStreamingServiceIdBySlug(streamingServiceSlug);

	if (!streamingServiceId) {
		throw new Error(`Streaming service not found: ${streamingServiceSlug}`);
	}

	return db.insert(moviesTable).values({
		title,
		watchUrl,
		streamingServiceId,
	});
};

const extractMovieTitleFromText = async (
	text: string,
): Promise<string | null> => {
	const url = extractUrl(text);
	if (!url) return null;

	const html = await fetchHtml(url);
	const ogTitle = extractOgTitle(html);
	if (!ogTitle) return null;

	return normalizeMovieTitle(ogTitle);
};

const fetchHtml = async (url: string): Promise<string> => {
	const res = await fetch(url, {
		headers: {
			"User-Agent": "Mozilla/5.0",
		},
		cache: "no-store",
	});

	if (!res.ok) {
		throw new Error(`Failed to fetch: ${url}`);
	}

	return res.text();
};

/* =======================
 * Pure utilities
 * ======================= */

const extractUrl = (text: string): string | null =>
	text.match(/https?:\/\/[^\s]+/)?.[0] ?? null;

const extractOgTitle = (html: string): string | null => {
	const match = html.match(
		/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i,
	);
	return match?.[1] ?? null;
};

const stripAmazonPrefix = (title: string) =>
	title.replace(/^Amazon\.co\.jp:\s*/i, "");

const extractTitleByService = (ogTitle: string): string => {
	const normalized = stripAmazonPrefix(ogTitle);

	const patterns: RegExp[] = [
		// U-NEXT
		/^(.+?)\s*\(.*?\)\s*-\s*動画配信\s*\|/,

		// Netflix
		/^(.+?)を観.?る\s*\|/,

		// Hulu
		/^(.+?)\s*\|/,

		// Prime Video
		/^(.+?)\s*\(.*?\)を観.?る\s*\|/,

		// Disney+
		/^(.+?)を配信で見る\s*\|/,
	];

	return (
		patterns.map((pattern) => normalized.match(pattern)?.[1]).find(Boolean) ??
		normalized
	);
};

const cleanupTitle = (title: string) =>
	title
		.replace(/\s*\(.*?\)/g, "")
		.replace(/\s*[|｜-].*$/, "")
		.trim();

const normalizeMovieTitle = (ogTitle: string): string =>
	cleanupTitle(extractTitleByService(ogTitle));
