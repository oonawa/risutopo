import crypto from "node:crypto";
import { expect, test } from "@playwright/test";
import {
	listItemsTable,
	listsTable,
	streamingServicesTable,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { setupAuthenticatedUser } from "../../../helpers/auth";
import { resetDatabase, seedDatabase } from "../../../lib/dbHelpers";
import { db } from "../../../lib/testDb";

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

/** ローカルストレージに視聴済みの映画アイテムを1件セットする */
async function seedLocalStorageWithWatchedItem(
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
		isWatched: true,
		watchedAt: new Date().toISOString(),
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

/** DB にログイン済みユーザーのリストアイテムを1件作成する */
async function createDbListItem(userId: number) {
	const [list] = await db
		.select()
		.from(listsTable)
		.where(eq(listsTable.userId, userId));

	const [service] = await db
		.select()
		.from(streamingServicesTable)
		.where(eq(streamingServicesTable.slug, "netflix"));

	const [item] = await db
		.insert(listItemsTable)
		.values({
			publicId: crypto.randomUUID(),
			listId: list.id,
			streamingServiceId: service.id,
			watchUrl: "https://www.netflix.com/jp/title/80100172",
			titleOnService: "テスト映画",
			createdAt: new Date(),
		})
		.returning();

	return { list, item };
}

test.describe("WatchToggleButton - 機能テスト", () => {
	test.beforeEach(async () => {
		await resetDatabase();
		await seedDatabase();
	});

	test.afterEach(async () => {
		await resetDatabase();
	});

	// ── カードを閉じずに2回連続トグル ──────────────────────────────────────

	test("未認証ユーザーが iPhone でカードを閉じずに2回連続でトグルできる", async ({
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

		await page.getByRole("button", { name: "ポスター画像なし" }).click();
		await expect(
			page.getByRole("button", { name: "視聴済みにする" }),
		).toBeVisible();

		// 1回目：未視聴 → 視聴済み
		await page.getByRole("button", { name: "視聴済みにする" }).click();
		await expect(page.getByText("観た！")).toBeVisible();

		// 2回目：視聴済み → 未視聴（カードを閉じずに）
		await page.getByRole("button", { name: "視聴済みを解除する" }).click();
		await expect(page.getByText("もう観た？")).toBeVisible();
		await page.waitForTimeout(500);
		await expect(page.getByText("もう観た？")).toBeVisible();
		await expect(page.getByText("観た！")).not.toBeVisible();
	});

	// ── 未ログイン：未視聴 → 視聴済み ─────────────────────────────────────

	test("未認証ユーザーが iPhone でボタンを押すと「観た！」に変わり安定して維持される", async ({
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

		// アイテムをクリックしてボトムシートを開く
		await page.getByRole("button", { name: "ポスター画像なし" }).click();
		await expect(
			page.getByRole("button", { name: "視聴済みにする" }),
		).toBeVisible();

		// ボタンをクリック
		await page.getByRole("button", { name: "視聴済みにする" }).click();

		// 「観た！」に変わることを確認
		await expect(page.getByText("観た！")).toBeVisible();

		// 状態が安定して維持されることを確認（一瞬戻らない）
		await page.waitForTimeout(500);
		await expect(page.getByText("観た！")).toBeVisible();
		await expect(page.getByText("もう観た？")).not.toBeVisible();
	});

	test("未認証ユーザーが Pixel 7 でボタンを押すと「観た！」に変わり安定して維持される", async ({
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
		await page.getByRole("button", { name: "視聴済みにする" }).click();

		await expect(page.getByText("観た！")).toBeVisible();
		await page.waitForTimeout(500);
		await expect(page.getByText("観た！")).toBeVisible();
		await expect(page.getByText("もう観た？")).not.toBeVisible();
	});

	test("未認証ユーザーが Desktop Chrome でボタンを押すと「観た！」に変わり安定して維持される", async ({
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
		await page.getByRole("button", { name: "視聴済みにする" }).click();

		await expect(page.getByText("観た！")).toBeVisible();
		await page.waitForTimeout(500);
		await expect(page.getByText("観た！")).toBeVisible();
		await expect(page.getByText("もう観た？")).not.toBeVisible();
	});

	test("未認証ユーザーが Desktop Firefox でボタンを押すと「観た！」に変わり安定して維持される", async ({
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
		await page.getByRole("button", { name: "視聴済みにする" }).click();

		await expect(page.getByText("観た！")).toBeVisible();
		await page.waitForTimeout(500);
		await expect(page.getByText("観た！")).toBeVisible();
		await expect(page.getByText("もう観た？")).not.toBeVisible();
	});

	test("未認証ユーザーが Desktop Safari でボタンを押すと「観た！」に変わり安定して維持される", async ({
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
		await page.getByRole("button", { name: "視聴済みにする" }).click();

		await expect(page.getByText("観た！")).toBeVisible();
		await page.waitForTimeout(500);
		await expect(page.getByText("観た！")).toBeVisible();
		await expect(page.getByText("もう観た？")).not.toBeVisible();
	});

	// ── 未ログイン：視聴済み → 未視聴 ─────────────────────────────────────

	test("未認証ユーザーが iPhone で「観た！」状態のボタンを押すと「もう観た？」に戻り安定して維持される", async ({
		page,
	}, testInfo) => {
		test.skip(
			testInfo.project.name !== "mobile-webkit",
			"このテストは mobile-webkit プロジェクトのみ対象",
		);
		const listId = crypto.randomUUID();
		await page.goto(`/${listId}`);
		await seedLocalStorageWithWatchedItem(page, listId);
		await page.reload();

		await page.getByRole("button", { name: "ポスター画像なし" }).click();
		await expect(
			page.getByRole("button", { name: "視聴済みを解除する" }),
		).toBeVisible();
		await page.getByRole("button", { name: "視聴済みを解除する" }).click();

		await expect(page.getByText("もう観た？")).toBeVisible();
		await page.waitForTimeout(500);
		await expect(page.getByText("もう観た？")).toBeVisible();
		await expect(page.getByText("観た！")).not.toBeVisible();
	});

	test("未認証ユーザーが Pixel 7 で「観た！」状態のボタンを押すと「もう観た？」に戻り安定して維持される", async ({
		page,
	}, testInfo) => {
		test.skip(
			testInfo.project.name !== "mobile-chromium",
			"このテストは mobile-chromium プロジェクトのみ対象",
		);
		const listId = crypto.randomUUID();
		await page.goto(`/${listId}`);
		await seedLocalStorageWithWatchedItem(page, listId);
		await page.reload();

		await page.getByRole("button", { name: "ポスター画像なし" }).click();
		await expect(
			page.getByRole("button", { name: "視聴済みを解除する" }),
		).toBeVisible();
		await page.getByRole("button", { name: "視聴済みを解除する" }).click();

		await expect(page.getByText("もう観た？")).toBeVisible();
		await page.waitForTimeout(500);
		await expect(page.getByText("もう観た？")).toBeVisible();
		await expect(page.getByText("観た！")).not.toBeVisible();
	});

	test("未認証ユーザーが Desktop Chrome で「観た！」状態のボタンを押すと「もう観た？」に戻り安定して維持される", async ({
		page,
	}, testInfo) => {
		test.skip(
			testInfo.project.name !== "desktop-chromium",
			"このテストは desktop-chromium プロジェクトのみ対象",
		);
		const listId = crypto.randomUUID();
		await page.goto(`/${listId}`);
		await seedLocalStorageWithWatchedItem(page, listId);
		await page.reload();

		await page.getByRole("button", { name: "ポスター画像なし" }).click();
		await expect(
			page.getByRole("button", { name: "視聴済みを解除する" }),
		).toBeVisible();
		await page.getByRole("button", { name: "視聴済みを解除する" }).click();

		await expect(page.getByText("もう観た？")).toBeVisible();
		await page.waitForTimeout(500);
		await expect(page.getByText("もう観た？")).toBeVisible();
		await expect(page.getByText("観た！")).not.toBeVisible();
	});

	test("未認証ユーザーが Desktop Firefox で「観た！」状態のボタンを押すと「もう観た？」に戻り安定して維持される", async ({
		page,
	}, testInfo) => {
		test.skip(
			testInfo.project.name !== "desktop-firefox",
			"このテストは desktop-firefox プロジェクトのみ対象",
		);
		const listId = crypto.randomUUID();
		await page.goto(`/${listId}`);
		await seedLocalStorageWithWatchedItem(page, listId);
		await page.reload();

		await page.getByRole("button", { name: "ポスター画像なし" }).click();
		await expect(
			page.getByRole("button", { name: "視聴済みを解除する" }),
		).toBeVisible();
		await page.getByRole("button", { name: "視聴済みを解除する" }).click();

		await expect(page.getByText("もう観た？")).toBeVisible();
		await page.waitForTimeout(500);
		await expect(page.getByText("もう観た？")).toBeVisible();
		await expect(page.getByText("観た！")).not.toBeVisible();
	});

	test("未認証ユーザーが Desktop Safari で「観た！」状態のボタンを押すと「もう観た？」に戻り安定して維持される", async ({
		page,
	}, testInfo) => {
		test.skip(
			testInfo.project.name !== "desktop-webkit",
			"このテストは desktop-webkit プロジェクトのみ対象",
		);
		const listId = crypto.randomUUID();
		await page.goto(`/${listId}`);
		await seedLocalStorageWithWatchedItem(page, listId);
		await page.reload();

		await page.getByRole("button", { name: "ポスター画像なし" }).click();
		await expect(
			page.getByRole("button", { name: "視聴済みを解除する" }),
		).toBeVisible();
		await page.getByRole("button", { name: "視聴済みを解除する" }).click();

		await expect(page.getByText("もう観た？")).toBeVisible();
		await page.waitForTimeout(500);
		await expect(page.getByText("もう観た？")).toBeVisible();
		await expect(page.getByText("観た！")).not.toBeVisible();
	});

	// ── ログイン済み：楽観的更新が即座に反映され最終的にサーバー状態と一致 ──

	test("認証済みユーザーが iPhone でボタンを押すと楽観的更新が即座に反映され最終的にサーバー状態と一致する", async ({
		page,
		context,
	}, testInfo) => {
		test.skip(
			testInfo.project.name !== "mobile-webkit",
			"このテストは mobile-webkit プロジェクトのみ対象",
		);
		const userAgent = await page.evaluate(() => navigator.userAgent);
		const { userId } = await setupAuthenticatedUser(
			context,
			userAgent,
			testInfo.project.use.baseURL ?? "",
		);
		const { list } = await createDbListItem(userId);

		await page.goto(`/${list.publicId}`);
		await page.getByRole("button", { name: "ポスター画像なし" }).click();
		await expect(
			page.getByRole("button", { name: "視聴済みにする" }),
		).toBeVisible();

		await page.getByRole("button", { name: "視聴済みにする" }).click();

		// 楽観的更新が即座に反映される
		await expect(page.getByText("観た！")).toBeVisible();

		// サーバー処理完了後も「観た！」を維持
		await page.waitForTimeout(1000);
		await expect(page.getByText("観た！")).toBeVisible();
		await expect(page.getByText("もう観た？")).not.toBeVisible();
	});

	test("認証済みユーザーが Pixel 7 でボタンを押すと楽観的更新が即座に反映され最終的にサーバー状態と一致する", async ({
		page,
		context,
	}, testInfo) => {
		test.skip(
			testInfo.project.name !== "mobile-chromium",
			"このテストは mobile-chromium プロジェクトのみ対象",
		);
		const userAgent = await page.evaluate(() => navigator.userAgent);
		const { userId } = await setupAuthenticatedUser(
			context,
			userAgent,
			testInfo.project.use.baseURL ?? "",
		);
		const { list } = await createDbListItem(userId);

		await page.goto(`/${list.publicId}`);
		await page.getByRole("button", { name: "ポスター画像なし" }).click();
		await expect(
			page.getByRole("button", { name: "視聴済みにする" }),
		).toBeVisible();

		await page.getByRole("button", { name: "視聴済みにする" }).click();

		await expect(page.getByText("観た！")).toBeVisible();
		await page.waitForTimeout(1000);
		await expect(page.getByText("観た！")).toBeVisible();
		await expect(page.getByText("もう観た？")).not.toBeVisible();
	});

	test("認証済みユーザーが Desktop Chrome でボタンを押すと楽観的更新が即座に反映され最終的にサーバー状態と一致する", async ({
		page,
		context,
	}, testInfo) => {
		test.skip(
			testInfo.project.name !== "desktop-chromium",
			"このテストは desktop-chromium プロジェクトのみ対象",
		);
		const userAgent = await page.evaluate(() => navigator.userAgent);
		const { userId } = await setupAuthenticatedUser(
			context,
			userAgent,
			testInfo.project.use.baseURL ?? "",
		);
		const { list } = await createDbListItem(userId);

		await page.goto(`/${list.publicId}`);
		await page.getByRole("button", { name: "ポスター画像なし" }).click();
		await expect(
			page.getByRole("button", { name: "視聴済みにする" }),
		).toBeVisible();

		await page.getByRole("button", { name: "視聴済みにする" }).click();

		await expect(page.getByText("観た！")).toBeVisible();
		await page.waitForTimeout(1000);
		await expect(page.getByText("観た！")).toBeVisible();
		await expect(page.getByText("もう観た？")).not.toBeVisible();
	});

	test("認証済みユーザーが Desktop Firefox でボタンを押すと楽観的更新が即座に反映され最終的にサーバー状態と一致する", async ({
		page,
		context,
	}, testInfo) => {
		test.skip(
			testInfo.project.name !== "desktop-firefox",
			"このテストは desktop-firefox プロジェクトのみ対象",
		);
		const userAgent = await page.evaluate(() => navigator.userAgent);
		const { userId } = await setupAuthenticatedUser(
			context,
			userAgent,
			testInfo.project.use.baseURL ?? "",
		);
		const { list } = await createDbListItem(userId);

		await page.goto(`/${list.publicId}`);
		await page.getByRole("button", { name: "ポスター画像なし" }).click();
		await expect(
			page.getByRole("button", { name: "視聴済みにする" }),
		).toBeVisible();

		await page.getByRole("button", { name: "視聴済みにする" }).click();

		await expect(page.getByText("観た！")).toBeVisible();
		await page.waitForTimeout(1000);
		await expect(page.getByText("観た！")).toBeVisible();
		await expect(page.getByText("もう観た？")).not.toBeVisible();
	});

	test("認証済みユーザーが Desktop Safari でボタンを押すと楽観的更新が即座に反映され最終的にサーバー状態と一致する", async ({
		page,
		context,
	}, testInfo) => {
		test.skip(
			testInfo.project.name !== "desktop-webkit",
			"このテストは desktop-webkit プロジェクトのみ対象",
		);
		const userAgent = await page.evaluate(() => navigator.userAgent);
		const { userId } = await setupAuthenticatedUser(
			context,
			userAgent,
			testInfo.project.use.baseURL ?? "",
		);
		const { list } = await createDbListItem(userId);

		await page.goto(`/${list.publicId}`);
		await page.getByRole("button", { name: "ポスター画像なし" }).click();
		await expect(
			page.getByRole("button", { name: "視聴済みにする" }),
		).toBeVisible();

		await page.getByRole("button", { name: "視聴済みにする" }).click();

		await expect(page.getByText("観た！")).toBeVisible();
		await page.waitForTimeout(1000);
		await expect(page.getByText("観た！")).toBeVisible();
		await expect(page.getByText("もう観た？")).not.toBeVisible();
	});
});
