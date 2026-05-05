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
			value: { list: { listId, items: [item] }, subLists: [] },
		},
	);
	return item;
}

/** localStorageからlistIdを取得するポーリングヘルパー */
async function waitForListId(page: import("@playwright/test").Page): Promise<string> {
	const listId = await page.waitForFunction(
		({ key }: { key: string }) => {
			const raw = localStorage.getItem(key);
			if (!raw) return null;
			try {
				const parsed: unknown = JSON.parse(raw);
				if (
					parsed !== null &&
					typeof parsed === "object" &&
					"list" in parsed &&
					parsed.list !== null &&
					typeof parsed.list === "object" &&
					"listId" in parsed.list &&
					typeof parsed.list.listId === "string"
				) {
					return parsed.list.listId;
				}
			} catch {
				// ignore
			}
			return null;
		},
		{ key: LOCAL_STORAGE_KEY },
		{ timeout: 10_000 },
	);
	const value: unknown = await listId.jsonValue();
	if (typeof value !== "string") throw new Error("listId が取得できませんでした");
	return value;
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
		await page.goto("/");
		const listId = await waitForListId(page);
		await seedLocalStorageWithItem(page, listId);
		await page.reload();

		// ハイドレーション待ち
		const listLink = page.getByRole("link", { name: "リスト" });
		await expect(listLink).not.toHaveAttribute("href", "/undefined", { timeout: 10_000 });
		await listLink.click();
		await expect(page.getByText("テスト映画")).toBeVisible({ timeout: 10_000 });

		// カード展開前は body.style.overflow が hidden でないことを確認
		const overflowBefore = await page.evaluate(
			() => document.body.style.overflow,
		);
		expect(overflowBefore).not.toBe("hidden");

		// カードを展開する (リスト画面なので「ポスター画像なし」)
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
		await page.goto("/");
		const listId = await waitForListId(page);
		await seedLocalStorageWithItem(page, listId);
		await page.reload();

		// ハイドレーション待ち
		const listLink = page.getByRole("link", { name: "リスト" });
		await expect(listLink).not.toHaveAttribute("href", "/undefined", { timeout: 10_000 });
		await listLink.click();
		await expect(page.getByText("テスト映画")).toBeVisible({ timeout: 10_000 });

		// カードを展開する (リスト画面なので「ポスター画像なし」)
		await page.getByRole("button", { name: "ポスター画像なし" }).click();
		await expect(
			page.getByRole("button", { name: "視聴済みにする" }),
		).toBeVisible();

		// オーバーレイをクリックしてカードを閉じる
		// Vaul (Drawer) の背景オーバーレイをクリック
		await page.mouse.click(10, 10);

		// exit アニメーション完了を待つ
		await page.waitForTimeout(400);

		// カードが閉じた後は body.style.overflow が復元されることを確認
		const overflowAfter = await page.evaluate(
			() => document.body.style.overflow,
		);
		expect(overflowAfter).toBe("");
	});
});
