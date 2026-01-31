import { afterEach, describe, expect, it, vi } from "vitest";
import { db } from "@/db/client";
import { eq } from "drizzle-orm";
import { moviesTable, streamingServicesTable } from "@/db/schema";
import { registerMovie } from "./registerMovie";

describe("registerMovie", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("U-NEXTのジョン・ウィック：パラベラムをDBへ追加", async () => {
		const inputText =
			"「ジョン・ウィック：パラベラム」をU-NEXTで視聴 https://video-share.unext.jp/video/title/SID0045685?utm_source=copy&utm_medium=social&utm_campaign=nonad-sns&rid=PM061312883";

		const mockHtml = `
			<html>
				<head>
					<meta property="og:title" content="ジョン・ウィック：パラベラム (吹替版) - 動画配信 | U-NEXT" />
				</head>
			</html>
		`;

		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({
				ok: true,
				text: vi.fn().mockResolvedValue(mockHtml),
			}),
		);

		const formData = new FormData();
		formData.set("text", inputText);

		const result = await registerMovie(
			{ success: false, message: "" },
			formData,
		);

		expect(result.success).toBe(true);
		expect(result.data).toEqual({
			title: "ジョン・ウィック：パラベラム",
			watchUrl:
				"https://video-share.unext.jp/video/title/SID0045685?utm_source=copy&utm_medium=social&utm_campaign=nonad-sns&rid=PM061312883",
		});

		const movies = await db
			.select({
				title: moviesTable.title,
				watchUrl: moviesTable.watchUrl,
				streamingServiceId: moviesTable.streamingServiceId,
			})
			.from(moviesTable);

		const rows = await db
			.select({ id: streamingServicesTable.id })
			.from(streamingServicesTable)
			.where(eq(streamingServicesTable.slug, "unext"));

		expect(movies).toHaveLength(1);
		expect(movies[0]).toEqual({
			title: "ジョン・ウィック：パラベラム",
			watchUrl:
				"https://video-share.unext.jp/video/title/SID0045685?utm_source=copy&utm_medium=social&utm_campaign=nonad-sns&rid=PM061312883",
			streamingServiceId: rows[0].id,
		});
	});
});
