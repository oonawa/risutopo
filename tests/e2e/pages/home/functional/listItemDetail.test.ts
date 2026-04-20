import crypto from "node:crypto";
import { expect, test } from "@playwright/test";
import { resetDatabase, seedDatabase } from "../../../lib/dbHelpers";

const LOCAL_STORAGE_KEY = "risutopotto";

/** ローカルストレージに未視聴の映画アイテムを1件セットする */
async function seedLocalStorageWithUnwatchedItem(
	page: import("@playwright/test").Page,
	listId: string,
) {
	const item = {
		listItemId: crypto.randomUUID(),
		title: "テスト映画",
		url: "https://www.netflix.com/jp/title/80100172",
		serviceSlug: "netflix",
		serviceName: "Netflix",
		createdAt: new Date().toISOString(),
		isWatched: false,
		watchedAt: null,
	};
	await page.evaluate(
		({ key, value }) => {
			localStorage.setItem(key, JSON.stringify(value));
		},
		{
			key: LOCAL_STORAGE_KEY,
			value: { list: { listId, items: [item] } },
		},
	);
	return item;
}

test.describe("ListItemDetail - オーバーレイ機能テスト", () => {
	test.beforeEach(async () => {
		await resetDatabase();
		await seedDatabase();
	});

	test.afterEach(async () => {
		await resetDatabase();
	});

	// ── カード外クリックで詳細が閉じる ───────────────────────────────────────

	test("未認証ユーザーが iPhone でカード外をクリックすると詳細が閉じる", async ({
		page,
	}, testInfo) => {
		test.skip(
			testInfo.project.name !== "mobile-webkit",
			"このテストは mobile-webkit プロジェクトのみ対象",
		);
		const listId = crypto.randomUUID();
		await page.goto(`/${listId}`);
		await seedLocalStorageWithUnwatchedItem(page, listId);
		await page.reload();

		// カードをクリックしてボトムシートを開く
		await page.getByRole("button", { name: "ポスター画像なし" }).click();
		await expect(
			page.getByRole("button", { name: "視聴済みにする" }),
		).toBeVisible();

		// オーバーレイ（カード外）をクリック
		await page.mouse.click(10, 10);

		// ボトムシートが閉じることを確認
		await expect(
			page.getByRole("button", { name: "視聴済みにする" }),
		).not.toBeVisible();
	});

	test("未認証ユーザーが Pixel 7 でカード外をクリックすると詳細が閉じる", async ({
		page,
	}, testInfo) => {
		test.skip(
			testInfo.project.name !== "mobile-chromium",
			"このテストは mobile-chromium プロジェクトのみ対象",
		);
		const listId = crypto.randomUUID();
		await page.goto(`/${listId}`);
		await seedLocalStorageWithUnwatchedItem(page, listId);
		await page.reload();

		await page.getByRole("button", { name: "ポスター画像なし" }).click();
		await expect(
			page.getByRole("button", { name: "視聴済みにする" }),
		).toBeVisible();

		await page.mouse.click(10, 10);

		await expect(
			page.getByRole("button", { name: "視聴済みにする" }),
		).not.toBeVisible();
	});

	test("未認証ユーザーが Desktop Chrome でカード外をクリックすると詳細が閉じる", async ({
		page,
	}, testInfo) => {
		test.skip(
			testInfo.project.name !== "desktop-chromium",
			"このテストは desktop-chromium プロジェクトのみ対象",
		);
		const listId = crypto.randomUUID();
		await page.goto(`/${listId}`);
		await seedLocalStorageWithUnwatchedItem(page, listId);
		await page.reload();

		await page.getByRole("button", { name: "ポスター画像なし" }).click();
		await expect(
			page.getByRole("button", { name: "視聴済みにする" }),
		).toBeVisible();

		await page.mouse.click(10, 10);

		await expect(
			page.getByRole("button", { name: "視聴済みにする" }),
		).not.toBeVisible();
	});

	test("未認証ユーザーが Desktop Firefox でカード外をクリックすると詳細が閉じる", async ({
		page,
	}, testInfo) => {
		test.skip(
			testInfo.project.name !== "desktop-firefox",
			"このテストは desktop-firefox プロジェクトのみ対象",
		);
		const listId = crypto.randomUUID();
		await page.goto(`/${listId}`);
		await seedLocalStorageWithUnwatchedItem(page, listId);
		await page.reload();

		await page.getByRole("button", { name: "ポスター画像なし" }).click();
		await expect(
			page.getByRole("button", { name: "視聴済みにする" }),
		).toBeVisible();

		await page.mouse.click(10, 10);

		await expect(
			page.getByRole("button", { name: "視聴済みにする" }),
		).not.toBeVisible();
	});

	test("未認証ユーザーが Desktop Safari でカード外をクリックすると詳細が閉じる", async ({
		page,
	}, testInfo) => {
		test.skip(
			testInfo.project.name !== "desktop-webkit",
			"このテストは desktop-webkit プロジェクトのみ対象",
		);
		const listId = crypto.randomUUID();
		await page.goto(`/${listId}`);
		await seedLocalStorageWithUnwatchedItem(page, listId);
		await page.reload();

		await page.getByRole("button", { name: "ポスター画像なし" }).click();
		await expect(
			page.getByRole("button", { name: "視聴済みにする" }),
		).toBeVisible();

		await page.mouse.click(10, 10);

		await expect(
			page.getByRole("button", { name: "視聴済みにする" }),
		).not.toBeVisible();
	});
});
