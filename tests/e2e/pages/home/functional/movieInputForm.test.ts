import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";
import { setupAuthenticatedUser } from "../../../helpers/auth";
import { resetDatabase, seedDatabase } from "../../../lib/dbHelpers";

const MOVIE_TITLE = "グランド・イリュージョン 見破られたトリック";
const UNEXT_URL =
	"https://video-share.unext.jp/video/title/SID0027170?utm_source=copy&utm_medium=social&utm_campaign=nonad-sns&rid=PM061312883";
const UNEXT_SHARE_LINK = `「${MOVIE_TITLE}」をU-NEXTで視聴 ${UNEXT_URL}`;

// モバイルフォーム：共有リンクを入力して DraftNewItem パネルを検証
async function fillMobileFormAndVerify(page: Page) {
	const textarea = page.locator("textarea");
	await expect(textarea).toBeVisible();
	await textarea.fill(UNEXT_SHARE_LINK);
	await expect(page.getByRole("heading", { name: MOVIE_TITLE })).toBeVisible({
		timeout: 5000,
	});
	await expect(page.getByText("U-NEXT")).toBeVisible();
}

// PC フォーム：タイトルと URL を入力して DraftNewItem パネルを検証
async function fillPcFormAndVerify(page: Page) {
	await expect(page.locator("#title")).toBeVisible();
	await page.locator("#title").fill(MOVIE_TITLE);
	await page.locator("#watch-url").fill(UNEXT_URL);
	await page.getByRole("button", { name: "登録" }).click();
	await expect(page.getByRole("heading", { name: MOVIE_TITLE })).toBeVisible({
		timeout: 5000,
	});
	await expect(page.getByText("U-NEXT")).toBeVisible();
}

test.describe("MovieInputForm - 機能テスト", () => {
	test.beforeEach(async () => {
		await resetDatabase();
		await seedDatabase();
	});

	test.afterEach(async () => {
		await resetDatabase();
	});

	// ── モバイルフォーム（モバイル UA）────────────────────────────────────

	test("未認証ユーザーが iPhone でモバイルフォームから共有リンクで登録できる", async ({
		page,
	}, testInfo) => {
		test.skip(
			testInfo.project.name !== "mobile-webkit",
			"このテストは mobile-webkit プロジェクトのみ対象",
		);
		await page.goto("/");
		await fillMobileFormAndVerify(page);
	});

	test("未認証ユーザーが Pixel 7 でモバイルフォームから共有リンクで登録できる", async ({
		page,
	}, testInfo) => {
		test.skip(
			testInfo.project.name !== "mobile-chromium",
			"このテストは mobile-chromium プロジェクトのみ対象",
		);
		await page.goto("/");
		await fillMobileFormAndVerify(page);
	});

	test("認証済みユーザーが iPhone でモバイルフォームから共有リンクで登録できる", async ({
		page,
		context,
	}, testInfo) => {
		test.skip(
			testInfo.project.name !== "mobile-webkit",
			"このテストは mobile-webkit プロジェクトのみ対象",
		);
		const userAgent = await page.evaluate(() => navigator.userAgent);
		await setupAuthenticatedUser(context, userAgent, "http://localhost:3000");
		await page.goto("/");
		await fillMobileFormAndVerify(page);
	});

	// ── PC フォーム（デスクトップ UA）────────────────────────────────────

	test("未認証ユーザーが Desktop Chrome で PC フォームから登録できる", async ({
		page,
	}, testInfo) => {
		test.skip(
			testInfo.project.name !== "desktop-chromium",
			"このテストは desktop-chromium プロジェクトのみ対象",
		);
		await page.goto("/");
		await fillPcFormAndVerify(page);
	});

	test("認証済みユーザーが Desktop Chrome で PC フォームから登録できる", async ({
		page,
		context,
	}, testInfo) => {
		test.skip(
			testInfo.project.name !== "desktop-chromium",
			"このテストは desktop-chromium プロジェクトのみ対象",
		);
		const userAgent = await page.evaluate(() => navigator.userAgent);
		await setupAuthenticatedUser(context, userAgent, "http://localhost:3000");
		await page.goto("/");
		await fillPcFormAndVerify(page);
	});

	test("未認証ユーザーが Desktop Firefox で PC フォームから登録できる", async ({
		page,
	}, testInfo) => {
		test.skip(
			testInfo.project.name !== "desktop-firefox",
			"このテストは desktop-firefox プロジェクトのみ対象",
		);
		await page.goto("/");
		await fillPcFormAndVerify(page);
	});

	test("認証済みユーザーが Desktop Firefox で PC フォームから登録できる", async ({
		page,
		context,
	}, testInfo) => {
		test.skip(
			testInfo.project.name !== "desktop-firefox",
			"このテストは desktop-firefox プロジェクトのみ対象",
		);
		const userAgent = await page.evaluate(() => navigator.userAgent);
		await setupAuthenticatedUser(context, userAgent, "http://localhost:3000");
		await page.goto("/");
		await fillPcFormAndVerify(page);
	});

	test("未認証ユーザーが Desktop Safari で PC フォームから登録できる", async ({
		page,
	}, testInfo) => {
		test.skip(
			testInfo.project.name !== "desktop-webkit",
			"このテストは desktop-webkit プロジェクトのみ対象",
		);
		await page.goto("/");
		await fillPcFormAndVerify(page);
	});

	test("認証済みユーザーが Desktop Safari で PC フォームから登録できる", async ({
		page,
		context,
	}, testInfo) => {
		test.skip(
			testInfo.project.name !== "desktop-webkit",
			"このテストは desktop-webkit プロジェクトのみ対象",
		);
		const userAgent = await page.evaluate(() => navigator.userAgent);
		await setupAuthenticatedUser(context, userAgent, "http://localhost:3000");
		await page.goto("/");
		await fillPcFormAndVerify(page);
	});
});
