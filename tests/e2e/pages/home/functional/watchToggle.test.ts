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
			value: { list: { listId, items: [item] }, subLists: [] },
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
			value: { list: { listId, items: [item] }, subLists: [] },
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

/** 未認証ユーザー用のリスト画面遷移ヘルパー */
async function navigateToLocalList(page: import("@playwright/test").Page) {
	await page.goto("/");
	const listId = await waitForListId(page);
	await seedLocalStorageWithUnwatchedItem(page, listId);
	await page.reload();

	const listLink = page.getByRole("link", { name: "リスト" });
	await expect(listLink).not.toHaveAttribute("href", "/undefined", { timeout: 10_000 });
	await listLink.click();
	await expect(page.getByText("テスト映画")).toBeVisible({ timeout: 10_000 });
}

async function navigateToLocalWatchedList(page: import("@playwright/test").Page) {
	await page.goto("/");
	const listId = await waitForListId(page);
	await seedLocalStorageWithWatchedItem(page, listId);
	await page.reload();

	const listLink = page.getByRole("link", { name: "リスト" });
	await expect(listLink).not.toHaveAttribute("href", "/undefined", { timeout: 10_000 });
	await listLink.click();
	await expect(page.getByText("テスト映画")).toBeVisible({ timeout: 10_000 });
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
		test.skip(testInfo.project.name !== "mobile-webkit", "mobile-webkitのみ対象");
		await navigateToLocalList(page);

		await page.getByRole("button", { name: "ポスター画像なし" }).click();
		await expect(page.getByRole("button", { name: "視聴済みにする" })).toBeVisible();

		await page.getByRole("button", { name: "視聴済みにする" }).click();
		await expect(page.getByText("観た！")).toBeVisible();

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
		test.skip(testInfo.project.name !== "mobile-webkit", "mobile-webkitのみ対象");
		await navigateToLocalList(page);

		await page.getByRole("button", { name: "ポスター画像なし" }).click();
		await expect(page.getByRole("button", { name: "視聴済みにする" })).toBeVisible();
		await page.getByRole("button", { name: "視聴済みにする" }).click();

		await expect(page.getByText("観た！")).toBeVisible();
		await page.waitForTimeout(500);
		await expect(page.getByText("観た！")).toBeVisible();
		await expect(page.getByText("もう観た？")).not.toBeVisible();
	});

	test("未認証ユーザーが Pixel 7 でボタンを押すと「観た！」に変わり安定して維持される", async ({
		page,
	}, testInfo) => {
		test.skip(testInfo.project.name !== "mobile-chromium", "mobile-chromiumのみ対象");
		await navigateToLocalList(page);

		await page.getByRole("button", { name: "ポスター画像なし" }).click();
		await expect(page.getByRole("button", { name: "視聴済みにする" })).toBeVisible();
		await page.getByRole("button", { name: "視聴済みにする" }).click();

		await expect(page.getByText("観た！")).toBeVisible();
		await page.waitForTimeout(500);
		await expect(page.getByText("観た！")).toBeVisible();
		await expect(page.getByText("もう観た？")).not.toBeVisible();
	});

	test("未認証ユーザーが Desktop Chrome でボタンを押すと「観た！」に変わり安定して維持される", async ({
		page,
	}, testInfo) => {
		test.skip(testInfo.project.name !== "desktop-chromium", "desktop-chromiumのみ対象");
		await navigateToLocalList(page);

		await page.getByRole("button", { name: "ポスター画像なし" }).click();
		await expect(page.getByRole("button", { name: "視聴済みにする" })).toBeVisible();
		await page.getByRole("button", { name: "視聴済みにする" }).click();

		await expect(page.getByText("観た！")).toBeVisible();
		await page.waitForTimeout(500);
		await expect(page.getByText("観た！")).toBeVisible();
		await expect(page.getByText("もう観た？")).not.toBeVisible();
	});

	test("未認証ユーザーが Desktop Firefox でボタンを押すと「観た！」に変わり安定して維持される", async ({
		page,
	}, testInfo) => {
		test.skip(testInfo.project.name !== "desktop-firefox", "desktop-firefoxのみ対象");
		await navigateToLocalList(page);

		await page.getByRole("button", { name: "ポスター画像なし" }).click();
		await expect(page.getByRole("button", { name: "視聴済みにする" })).toBeVisible();
		await page.getByRole("button", { name: "視聴済みにする" }).click();

		await expect(page.getByText("観た！")).toBeVisible();
		await page.waitForTimeout(500);
		await expect(page.getByText("観た！")).toBeVisible();
		await expect(page.getByText("もう観た？")).not.toBeVisible();
	});

	test("未認証ユーザーが Desktop Safari でボタンを押すと「観た！」に変わり安定して維持される", async ({
		page,
	}, testInfo) => {
		test.skip(testInfo.project.name !== "desktop-webkit", "desktop-webkitのみ対象");
		await navigateToLocalList(page);

		await page.getByRole("button", { name: "ポスター画像なし" }).click();
		await expect(page.getByRole("button", { name: "視聴済みにする" })).toBeVisible();
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
		test.skip(testInfo.project.name !== "mobile-webkit", "mobile-webkitのみ対象");
		await navigateToLocalWatchedList(page);

		await page.getByRole("button", { name: "ポスター画像なし" }).click();
		await expect(page.getByRole("button", { name: "視聴済みを解除する" })).toBeVisible();
		await page.getByRole("button", { name: "視聴済みを解除する" }).click();

		await expect(page.getByText("もう観た？")).toBeVisible();
		await page.waitForTimeout(500);
		await expect(page.getByText("もう観た？")).toBeVisible();
		await expect(page.getByText("観た！")).not.toBeVisible();
	});

	test("未認証ユーザーが Pixel 7 で「観た！」状態のボタンを押すと「もう観た？」に戻り安定して維持される", async ({
		page,
	}, testInfo) => {
		test.skip(testInfo.project.name !== "mobile-chromium", "mobile-chromiumのみ対象");
		await navigateToLocalWatchedList(page);

		await page.getByRole("button", { name: "ポスター画像なし" }).click();
		await expect(page.getByRole("button", { name: "視聴済みを解除する" })).toBeVisible();
		await page.getByRole("button", { name: "視聴済みを解除する" }).click();

		await expect(page.getByText("もう観た？")).toBeVisible();
		await page.waitForTimeout(500);
		await expect(page.getByText("もう観た？")).toBeVisible();
		await expect(page.getByText("観た！")).not.toBeVisible();
	});

	test("未認証ユーザーが Desktop Chrome で「観た！」状態のボタンを押すと「もう観た？」に戻り安定して維持される", async ({
		page,
	}, testInfo) => {
		test.skip(testInfo.project.name !== "desktop-chromium", "desktop-chromiumのみ対象");
		await navigateToLocalWatchedList(page);

		await page.getByRole("button", { name: "ポスター画像なし" }).click();
		await expect(page.getByRole("button", { name: "視聴済みを解除する" })).toBeVisible();
		await page.getByRole("button", { name: "視聴済みを解除する" }).click();

		await expect(page.getByText("もう観た？")).toBeVisible();
		await page.waitForTimeout(500);
		await expect(page.getByText("もう観た？")).toBeVisible();
		await expect(page.getByText("観た！")).not.toBeVisible();
	});

	test("未認証ユーザーが Desktop Firefox で「観た！」状態のボタンを押すと「もう観た？」に戻り安定して維持される", async ({
		page,
	}, testInfo) => {
		test.skip(testInfo.project.name !== "desktop-firefox", "desktop-firefoxのみ対象");
		await navigateToLocalWatchedList(page);

		await page.getByRole("button", { name: "ポスター画像なし" }).click();
		await expect(page.getByRole("button", { name: "視聴済みを解除する" })).toBeVisible();
		await page.getByRole("button", { name: "視聴済みを解除する" }).click();

		await expect(page.getByText("もう観た？")).toBeVisible();
		await page.waitForTimeout(500);
		await expect(page.getByText("もう観た？")).toBeVisible();
		await expect(page.getByText("観た！")).not.toBeVisible();
	});

	test("未認証ユーザーが Desktop Safari で「観た！」状態のボタンを押すと「もう観た？」に戻り安定して維持される", async ({
		page,
	}, testInfo) => {
		test.skip(testInfo.project.name !== "desktop-webkit", "desktop-webkitのみ対象");
		await navigateToLocalWatchedList(page);

		await page.getByRole("button", { name: "ポスター画像なし" }).click();
		await expect(page.getByRole("button", { name: "視聴済みを解除する" })).toBeVisible();
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
		test.skip(testInfo.project.name !== "mobile-webkit", "mobile-webkitのみ対象");
		const userAgent = await page.evaluate(() => navigator.userAgent);
		const { userId } = await setupAuthenticatedUser(context, userAgent, testInfo.project.use.baseURL ?? "");
		const { list } = await createDbListItem(userId);

		await page.goto(`/${list.publicId}`);
		await page.getByRole("button", { name: "ポスター画像なし" }).click();
		await expect(page.getByRole("button", { name: "視聴済みにする" })).toBeVisible();
		await page.getByRole("button", { name: "視聴済みにする" }).click();

		await expect(page.getByText("観た！")).toBeVisible();
		await page.waitForTimeout(1000);
		await expect(page.getByText("観た！")).toBeVisible();
		await expect(page.getByText("もう観た？")).not.toBeVisible();
	});

	test("認証済みユーザーが Pixel 7 でボタンを押すと楽観的更新が即座に反映され最終的にサーバー状態と一致する", async ({
		page,
		context,
	}, testInfo) => {
		test.skip(testInfo.project.name !== "mobile-chromium", "mobile-chromiumのみ対象");
		const userAgent = await page.evaluate(() => navigator.userAgent);
		const { userId } = await setupAuthenticatedUser(context, userAgent, testInfo.project.use.baseURL ?? "");
		const { list } = await createDbListItem(userId);

		await page.goto(`/${list.publicId}`);
		await page.getByRole("button", { name: "ポスター画像なし" }).click();
		await expect(page.getByRole("button", { name: "視聴済みにする" })).toBeVisible();
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
		test.skip(testInfo.project.name !== "desktop-chromium", "desktop-chromiumのみ対象");
		const userAgent = await page.evaluate(() => navigator.userAgent);
		const { userId } = await setupAuthenticatedUser(context, userAgent, testInfo.project.use.baseURL ?? "");
		const { list } = await createDbListItem(userId);

		await page.goto(`/${list.publicId}`);
		await page.getByRole("button", { name: "ポスター画像なし" }).click();
		await expect(page.getByRole("button", { name: "視聴済みにする" })).toBeVisible();
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
		test.skip(testInfo.project.name !== "desktop-firefox", "desktop-firefoxのみ対象");
		const userAgent = await page.evaluate(() => navigator.userAgent);
		const { userId } = await setupAuthenticatedUser(context, userAgent, testInfo.project.use.baseURL ?? "");
		const { list } = await createDbListItem(userId);

		await page.goto(`/${list.publicId}`);
		await page.getByRole("button", { name: "ポスター画像なし" }).click();
		await expect(page.getByRole("button", { name: "視聴済みにする" })).toBeVisible();
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
		test.skip(testInfo.project.name !== "desktop-webkit", "desktop-webkitのみ対象");
		const userAgent = await page.evaluate(() => navigator.userAgent);
		const { userId } = await setupAuthenticatedUser(context, userAgent, testInfo.project.use.baseURL ?? "");
		const { list } = await createDbListItem(userId);

		await page.goto(`/${list.publicId}`);
		await page.getByRole("button", { name: "ポスター画像なし" }).click();
		await expect(page.getByRole("button", { name: "視聴済みにする" })).toBeVisible();
		await page.getByRole("button", { name: "視聴済みにする" }).click();

		await expect(page.getByText("観た！")).toBeVisible();
		await page.waitForTimeout(1000);
		await expect(page.getByText("観た！")).toBeVisible();
		await expect(page.getByText("もう観た？")).not.toBeVisible();
	});
});
