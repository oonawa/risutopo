import crypto from "node:crypto";
import { expect, test } from "@playwright/test";
import { resetDatabase, seedDatabase } from "../../../lib/dbHelpers";

const LOCAL_STORAGE_KEY = "risutopotto";

/** ローカルストレージに未視聴の映画アイテムを1件セットする */
async function seedLocalStorageWithItem(
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

test.describe("スクロールロック - 機能テスト", () => {
	test.beforeEach(async () => {
		await resetDatabase();
		await seedDatabase();
	});

	test.afterEach(async () => {
		await resetDatabase();
	});

	test("Desktop Chrome でカード展開中は body のスクロールが無効化される", async ({
		page,
	}, testInfo) => {
		test.skip(
			testInfo.project.name !== "desktop-chromium",
			"このテストは desktop-chromium プロジェクトのみ対象",
		);
		const listId = crypto.randomUUID();
		await page.goto(`/${listId}`);
		await seedLocalStorageWithItem(page, listId);
		await page.reload();

		// カード展開前は body.style.overflow が hidden でないことを確認
		const overflowBefore = await page.evaluate(
			() => document.body.style.overflow,
		);
		expect(overflowBefore).not.toBe("hidden");

		// カードを展開する
		await page.getByRole("button", { name: "ポスター画像なし" }).click();
		await expect(
			page.getByRole("button", { name: "視聴済みにする" }),
		).toBeVisible();

		// 展開中は body.style.overflow が hidden になることを確認
		const overflowOpen = await page.evaluate(
			() => document.body.style.overflow,
		);
		expect(overflowOpen).toBe("hidden");
	});

	test("Desktop Chrome でカードを閉じると body のスクロールが復元される", async ({
		page,
	}, testInfo) => {
		test.skip(
			testInfo.project.name !== "desktop-chromium",
			"このテストは desktop-chromium プロジェクトのみ対象",
		);
		const listId = crypto.randomUUID();
		await page.goto(`/${listId}`);
		await seedLocalStorageWithItem(page, listId);
		await page.reload();

		// カードを展開する
		await page.getByRole("button", { name: "ポスター画像なし" }).click();
		await expect(
			page.getByRole("button", { name: "視聴済みにする" }),
		).toBeVisible();

		// オーバーレイをクリックしてカードを閉じる
		await page.locator(".fixed.inset-0.z-40").click();

		// exit アニメーション完了を待つ
		await page.waitForTimeout(400);

		// カードが閉じた後は body.style.overflow が復元されることを確認
		const overflowAfter = await page.evaluate(
			() => document.body.style.overflow,
		);
		expect(overflowAfter).toBe("");
	});
});
