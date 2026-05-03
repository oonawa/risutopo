import crypto from "node:crypto";
import { expect, test } from "@playwright/test";
import { eq } from "drizzle-orm";
import {
	listItemMovieMatchTable,
	listItemsTable,
	listsTable,
	moviesTable,
	streamingServicesTable,
} from "@/db/schema";
import { setupAuthenticatedUser } from "../../../helpers/auth";
import { resetDatabase, seedDatabase } from "../../../lib/dbHelpers";
import { db } from "../../../lib/testDb";

test.describe("SortButton - ネストドロップダウン機能テスト", () => {
	test.beforeEach(async () => {
		await resetDatabase();
		await seedDatabase();
	});

	test.afterEach(async () => {
		await resetDatabase();
	});

	async function setupTestData(context: import("@playwright/test").BrowserContext, userAgent: string, baseUrl: string) {
		const { userId } = await setupAuthenticatedUser(context, userAgent, baseUrl);

		const [list] = await db
			.select({ id: listsTable.id, publicId: listsTable.publicId })
			.from(listsTable)
			.where(eq(listsTable.userId, userId));

		const [service] = await db
			.select({ id: streamingServicesTable.id })
			.from(streamingServicesTable)
			.limit(1);

		// 映画A・映画Bをmoviesテーブルに挿入
		const [movieA] = await db
			.insert(moviesTable)
			.values({
				externalDatabaseMovieId: `test-movie-a-${crypto.randomUUID()}`,
				title: "映画A",
				overview: "",
				backgroundImage: "",
				posterImage: "",
				runningMinutes: 90,
				releaseDate: "2023-06-01",
			})
			.returning({ id: moviesTable.id });

		const [movieB] = await db
			.insert(moviesTable)
			.values({
				externalDatabaseMovieId: `test-movie-b-${crypto.randomUUID()}`,
				title: "映画B",
				overview: "",
				backgroundImage: "",
				posterImage: "",
				runningMinutes: 120,
				releaseDate: "2024-01-01",
			})
			.returning({ id: moviesTable.id });

		// リストアイテムをDBに挿入
		const [itemA] = await db
			.insert(listItemsTable)
			.values({
				publicId: crypto.randomUUID(),
				listId: list.id,
				titleOnService: "映画A",
				watchUrl: "https://example.com/a",
				streamingServiceId: service.id,
				createdAt: new Date("2024-01-01T00:00:00.000Z"),
			})
			.returning({ id: listItemsTable.id });

		const [itemB] = await db
			.insert(listItemsTable)
			.values({
				publicId: crypto.randomUUID(),
				listId: list.id,
				titleOnService: "映画B",
				watchUrl: "https://example.com/b",
				streamingServiceId: service.id,
				createdAt: new Date("2024-03-01T00:00:00.000Z"),
			})
			.returning({ id: listItemsTable.id });

		// listItemMovieMatchTableで映画と紐付け
		await db.insert(listItemMovieMatchTable).values([
			{ listItemId: itemA.id, movieId: movieA.id },
			{ listItemId: itemB.id, movieId: movieB.id },
		]);

		return { list };
	}

	// ──────────────────────────────────────────────
	// 全プロジェクト対象（ホバー不要）
	// ──────────────────────────────────────────────

	test("ソートボタンをクリックすると1階層目に「追加日」「公開日」「再生時間」の3項目が表示される", async ({
		page,
		context,
	}, testInfo) => {
		const baseUrl = testInfo.project.use.baseURL ?? "http://localhost:3001";
		const userAgent = testInfo.project.use.userAgent ?? "";
		const { list } = await setupTestData(context, userAgent, baseUrl);

		await page.goto(`/${list.publicId}`);
		await expect(page.getByText("映画A")).toBeVisible();

		await page.getByRole("button", { name: "並べ替え" }).click();
		await expect(page.getByText("追加日")).toBeVisible();
		await expect(page.getByText("公開日")).toBeVisible();
		await expect(page.getByText("再生時間")).toBeVisible();
	});

	test("createdAt_desc が選択中のとき、ソートボタンを開くと1階層目「追加日」にハイライトが付いている（全プロジェクト）", async ({
		page,
		context,
	}, testInfo) => {
		const baseUrl = testInfo.project.use.baseURL ?? "http://localhost:3001";
		const userAgent = testInfo.project.use.userAgent ?? "";
		const { list } = await setupTestData(context, userAgent, baseUrl);

		await page.goto(`/${list.publicId}?sort=createdAt_desc`);
		await expect(page.getByText("映画A")).toBeVisible();

		await page.getByRole("button", { name: "並べ替え" }).click();
		const highlightedTrigger = page.locator("[data-group-active='true']");
		await expect(highlightedTrigger).toBeVisible();
		await expect(highlightedTrigger).toHaveText("追加日");
	});

	// ──────────────────────────────────────────────
	// デスクトップのみ（ホバー操作を使用）
	// ──────────────────────────────────────────────

	test("1階層目「追加日」にホバーすると派生メニューに「新しい順」「古い順」が表示される", async ({
		page,
		context,
	}, testInfo) => {
		if (testInfo.project.name.startsWith("mobile")) {
			test.skip(true, "このテストはモバイルプロジェクトでスキップ");
		}
		const baseUrl = testInfo.project.use.baseURL ?? "http://localhost:3001";
		const userAgent = testInfo.project.use.userAgent ?? "";
		const { list } = await setupTestData(context, userAgent, baseUrl);

		await page.goto(`/${list.publicId}`);
		await expect(page.getByText("映画A")).toBeVisible();

		await page.getByRole("button", { name: "並べ替え" }).click();
		await page.getByText("追加日").hover();
		await expect(page.getByText("新しい順")).toBeVisible();
		await expect(page.getByText("古い順")).toBeVisible();
	});

	test("1階層目「公開日」にホバーすると派生メニューに「新しい順」「古い順」が表示される", async ({
		page,
		context,
	}, testInfo) => {
		if (testInfo.project.name.startsWith("mobile")) {
			test.skip(true, "このテストはモバイルプロジェクトでスキップ");
		}
		const baseUrl = testInfo.project.use.baseURL ?? "http://localhost:3001";
		const userAgent = testInfo.project.use.userAgent ?? "";
		const { list } = await setupTestData(context, userAgent, baseUrl);

		await page.goto(`/${list.publicId}`);
		await expect(page.getByText("映画A")).toBeVisible();

		await page.getByRole("button", { name: "並べ替え" }).click();
		await page.getByText("公開日").hover();
		await expect(page.getByText("新しい順")).toBeVisible();
		await expect(page.getByText("古い順")).toBeVisible();
	});

	test("1階層目「再生時間」にホバーすると派生メニューに「長い順」「短い順」が表示される", async ({
		page,
		context,
	}, testInfo) => {
		if (testInfo.project.name.startsWith("mobile")) {
			test.skip(true, "このテストはモバイルプロジェクトでスキップ");
		}
		const baseUrl = testInfo.project.use.baseURL ?? "http://localhost:3001";
		const userAgent = testInfo.project.use.userAgent ?? "";
		const { list } = await setupTestData(context, userAgent, baseUrl);

		await page.goto(`/${list.publicId}`);
		await expect(page.getByText("映画A")).toBeVisible();

		await page.getByRole("button", { name: "並べ替え" }).click();
		await page.getByText("再生時間").hover();
		await expect(page.getByText("長い順")).toBeVisible();
		await expect(page.getByText("短い順")).toBeVisible();
	});

	test("「追加日 → 古い順」を選択するとURLに ?sort=createdAt_asc が付く", async ({
		page,
		context,
	}, testInfo) => {
		if (testInfo.project.name.startsWith("mobile")) {
			test.skip(true, "このテストはモバイルプロジェクトでスキップ");
		}
		const baseUrl = testInfo.project.use.baseURL ?? "http://localhost:3001";
		const userAgent = testInfo.project.use.userAgent ?? "";
		const { list } = await setupTestData(context, userAgent, baseUrl);

		await page.goto(`/${list.publicId}`);
		await expect(page.getByText("映画A")).toBeVisible();

		await page.getByRole("button", { name: "並べ替え" }).click();
		await page.getByText("追加日").hover();
		await page.getByText("古い順").click();
		await expect(page).toHaveURL(/sort=createdAt_asc/);
	});

	test("「公開日 → 新しい順」を選択するとURLに ?sort=releaseDate_desc が付く", async ({
		page,
		context,
	}, testInfo) => {
		if (testInfo.project.name.startsWith("mobile")) {
			test.skip(true, "このテストはモバイルプロジェクトでスキップ");
		}
		const baseUrl = testInfo.project.use.baseURL ?? "http://localhost:3001";
		const userAgent = testInfo.project.use.userAgent ?? "";
		const { list } = await setupTestData(context, userAgent, baseUrl);

		await page.goto(`/${list.publicId}`);
		await expect(page.getByText("映画A")).toBeVisible();

		await page.getByRole("button", { name: "並べ替え" }).click();
		await page.getByText("公開日").hover();
		await page.getByText("新しい順").click();
		await expect(page).toHaveURL(/sort=releaseDate_desc/);
	});

	test("「再生時間 → 長い順」を選択するとURLに ?sort=runningMinutes_desc が付く", async ({
		page,
		context,
	}, testInfo) => {
		if (testInfo.project.name.startsWith("mobile")) {
			test.skip(true, "このテストはモバイルプロジェクトでスキップ");
		}
		const baseUrl = testInfo.project.use.baseURL ?? "http://localhost:3001";
		const userAgent = testInfo.project.use.userAgent ?? "";
		const { list } = await setupTestData(context, userAgent, baseUrl);

		await page.goto(`/${list.publicId}`);
		await expect(page.getByText("映画A")).toBeVisible();

		await page.getByRole("button", { name: "並べ替え" }).click();
		await page.getByText("再生時間").hover();
		await page.getByText("長い順").click();
		await expect(page).toHaveURL(/sort=runningMinutes_desc/);
	});

	// ──────────────────────────────────────────────
	// ハイライト - 全プロジェクト対象
	// ──────────────────────────────────────────────

	test("runningMinutes_desc 適用中でドロップダウンを開くと「再生時間」トリガーにハイライトが付く（全プロジェクト）", async ({
		page,
		context,
	}, testInfo) => {
		const baseUrl = testInfo.project.use.baseURL ?? "http://localhost:3001";
		const userAgent = testInfo.project.use.userAgent ?? "";
		const { list } = await setupTestData(context, userAgent, baseUrl);

		await page.goto(`/${list.publicId}?sort=runningMinutes_desc`);
		await expect(page.getByText("映画A")).toBeVisible();

		await page.getByRole("button", { name: "並べ替え" }).click();
		const highlightedTrigger = page.locator("[data-group-active='true']");
		await expect(highlightedTrigger).toBeVisible();
		await expect(highlightedTrigger).toHaveText("再生時間");
	});

	test("ソート未適用でドロップダウンを開くと「追加日」トリガーにハイライトが付く（全プロジェクト）", async ({
		page,
		context,
	}, testInfo) => {
		const baseUrl = testInfo.project.use.baseURL ?? "http://localhost:3001";
		const userAgent = testInfo.project.use.userAgent ?? "";
		const { list } = await setupTestData(context, userAgent, baseUrl);

		await page.goto(`/${list.publicId}`);
		await expect(page.getByText("映画A")).toBeVisible();

		await page.getByRole("button", { name: "並べ替え" }).click();
		const highlightedTrigger = page.locator("[data-group-active='true']");
		await expect(highlightedTrigger).toBeVisible();
		await expect(highlightedTrigger).toHaveText("追加日");
	});

	// ──────────────────────────────────────────────
	// ハイライト - デスクトップのみ（ホバー操作を使用）
	// ──────────────────────────────────────────────

	test("runningMinutes_desc 適用中でサブメニューを開くと「長い順」にハイライトが付く（デスクトップのみ）", async ({
		page,
		context,
	}, testInfo) => {
		if (testInfo.project.name.startsWith("mobile")) {
			test.skip(true, "このテストはモバイルプロジェクトでスキップ");
		}
		const baseUrl = testInfo.project.use.baseURL ?? "http://localhost:3001";
		const userAgent = testInfo.project.use.userAgent ?? "";
		const { list } = await setupTestData(context, userAgent, baseUrl);

		await page.goto(`/${list.publicId}?sort=runningMinutes_desc`);
		await expect(page.getByText("映画A")).toBeVisible();

		await page.getByRole("button", { name: "並べ替え" }).click();
		await page.getByText("再生時間").hover();
		const highlightedItem = page.locator("[data-item-active='true']");
		await expect(highlightedItem).toBeVisible();
		await expect(highlightedItem).toHaveText("長い順");
	});

	test("「追加日」トリガーにホバーすると「追加日」にハイライトが付き「再生時間」からは消える（デスクトップのみ）", async ({
		page,
		context,
	}, testInfo) => {
		if (testInfo.project.name.startsWith("mobile")) {
			test.skip(true, "このテストはモバイルプロジェクトでスキップ");
		}
		const baseUrl = testInfo.project.use.baseURL ?? "http://localhost:3001";
		const userAgent = testInfo.project.use.userAgent ?? "";
		const { list } = await setupTestData(context, userAgent, baseUrl);

		await page.goto(`/${list.publicId}?sort=runningMinutes_desc`);
		await expect(page.getByText("映画A")).toBeVisible();

		await page.getByRole("button", { name: "並べ替え" }).click();
		await page.getByText("追加日").hover();
		const highlightedTrigger = page.locator("[data-group-active='true']");
		await expect(highlightedTrigger).toBeVisible();
		await expect(highlightedTrigger).toHaveText("追加日");
	});

	test("「追加日」からホバーを外すと「再生時間」にハイライトが復活する（デスクトップのみ）", async ({
		page,
		context,
	}, testInfo) => {
		if (testInfo.project.name.startsWith("mobile")) {
			test.skip(true, "このテストはモバイルプロジェクトでスキップ");
		}
		const baseUrl = testInfo.project.use.baseURL ?? "http://localhost:3001";
		const userAgent = testInfo.project.use.userAgent ?? "";
		const { list } = await setupTestData(context, userAgent, baseUrl);

		await page.goto(`/${list.publicId}?sort=runningMinutes_desc`);
		await expect(page.getByText("映画A")).toBeVisible();

		// ドロップダウンを開いて「追加日」にホバー
		await page.getByRole("button", { name: "並べ替え" }).click();
		await page.getByText("追加日").hover();
		// ドロップダウンを閉じて再度開くことで hoveredGroupKey がリセットされ、activeSortKey のハイライトが復活する
		await page.keyboard.press("Escape");
		await page.getByRole("button", { name: "並べ替え" }).click();
		const highlightedTrigger = page.locator("[data-group-active='true']");
		await expect(highlightedTrigger).toBeVisible();
		await expect(highlightedTrigger).toHaveText("再生時間");
	});

	test("サブメニュー内で「短い順」にホバーすると「短い順」にハイライトが付き「長い順」からは消える（デスクトップのみ）", async ({
		page,
		context,
	}, testInfo) => {
		if (testInfo.project.name.startsWith("mobile")) {
			test.skip(true, "このテストはモバイルプロジェクトでスキップ");
		}
		const baseUrl = testInfo.project.use.baseURL ?? "http://localhost:3001";
		const userAgent = testInfo.project.use.userAgent ?? "";
		const { list } = await setupTestData(context, userAgent, baseUrl);

		await page.goto(`/${list.publicId}?sort=runningMinutes_desc`);
		await expect(page.getByText("映画A")).toBeVisible();

		await page.getByRole("button", { name: "並べ替え" }).click();
		await page.getByText("再生時間").hover();
		await page.getByText("短い順").hover();
		const highlightedItem = page.locator("[data-item-active='true']");
		await expect(highlightedItem).toBeVisible();
		await expect(highlightedItem).toHaveText("短い順");
	});

	test("ソート未適用でサブメニューを開くと「新しい順」にハイライトが付く（デスクトップのみ）", async ({
		page,
		context,
	}, testInfo) => {
		if (testInfo.project.name.startsWith("mobile")) {
			test.skip(true, "このテストはモバイルプロジェクトでスキップ");
		}
		const baseUrl = testInfo.project.use.baseURL ?? "http://localhost:3001";
		const userAgent = testInfo.project.use.userAgent ?? "";
		const { list } = await setupTestData(context, userAgent, baseUrl);

		await page.goto(`/${list.publicId}`);
		await expect(page.getByText("映画A")).toBeVisible();

		await page.getByRole("button", { name: "並べ替え" }).click();
		await page.getByText("追加日").hover();
		const highlightedItem = page.locator("[data-item-active='true']");
		await expect(highlightedItem).toBeVisible();
		await expect(highlightedItem).toHaveText("新しい順");
	});

	test("ソート未適用で「公開日」にホバーしてサブメニューの「新しい順」にホバーすると、「公開日」トリガーがハイライトを維持したまま「新しい順」にもハイライトが付く（デスクトップのみ）", async ({
		page,
		context,
	}, testInfo) => {
		if (testInfo.project.name.startsWith("mobile")) {
			test.skip(true, "このテストはモバイルプロジェクトでスキップ");
		}
		const baseUrl = testInfo.project.use.baseURL ?? "http://localhost:3001";
		const userAgent = testInfo.project.use.userAgent ?? "";
		const { list } = await setupTestData(context, userAgent, baseUrl);

		await page.goto(`/${list.publicId}`);
		await expect(page.getByText("映画A")).toBeVisible();

		await page.getByRole("button", { name: "並べ替え" }).click();
		await page.getByText("公開日").hover();
		// 公開日サブメニューが開くのを待つ
		const releaseDateSubMenu = page.getByRole("menu", { name: "公開日" });
		await expect(releaseDateSubMenu).toBeVisible();
		// サブメニュー項目にReactのmouseenterを発火（公開日サブメニュー内の「新しい順」）
		const releaseDateNewItem = releaseDateSubMenu.getByRole("menuitem", { name: "新しい順" });
		await releaseDateNewItem.dispatchEvent("mouseover");

		// 「公開日」トリガーにハイライトが維持されている
		const highlightedTrigger = page.locator("[data-group-active='true']");
		await expect(highlightedTrigger).toBeVisible();
		await expect(highlightedTrigger).toHaveText("公開日");

		// 「新しい順」にもハイライトが付いている
		const highlightedItem = page.locator("[data-item-active='true']");
		await expect(highlightedItem).toBeVisible();
		await expect(highlightedItem).toHaveText("新しい順");
	});

	test("ソート未適用で「公開日」サブメニューの「新しい順」にホバー中は「追加日」ではなく「公開日」にハイライトが付く（デスクトップのみ）", async ({
		page,
		context,
	}, testInfo) => {
		if (testInfo.project.name.startsWith("mobile")) {
			test.skip(true, "このテストはモバイルプロジェクトでスキップ");
		}
		const baseUrl = testInfo.project.use.baseURL ?? "http://localhost:3001";
		const userAgent = testInfo.project.use.userAgent ?? "";
		const { list } = await setupTestData(context, userAgent, baseUrl);

		// ソート未適用なのでデフォルト(createdAt_desc)が適用されている
		await page.goto(`/${list.publicId}`);
		await expect(page.getByText("映画A")).toBeVisible();

		await page.getByRole("button", { name: "並べ替え" }).click();
		await page.getByText("公開日").hover();
		const releaseDateSubMenu = page.getByRole("menu", { name: "公開日" });
		await expect(releaseDateSubMenu).toBeVisible();
		const releaseDateNewItem = releaseDateSubMenu.getByRole("menuitem", { name: "新しい順" });
		await releaseDateNewItem.dispatchEvent("mouseenter");

		// 「追加日」にはハイライトが付いていない
		const allHighlightedTriggers = page.locator("[data-group-active='true']");
		await expect(allHighlightedTriggers).toHaveCount(1);
		await expect(allHighlightedTriggers).toHaveText("公開日");
	});
});
