import crypto from "node:crypto";
import { expect, test } from "@playwright/test";
import { subListsTable, listsTable } from "@/db/schema";
import { setupAuthenticatedUser } from "../../../helpers/auth";
import { resetDatabase, seedDatabase } from "../../../lib/dbHelpers";
import { db } from "../../../lib/testDb";
import { seedLocalStorageViaInitScript } from "../../../helpers/localStorageSeed";

type SubListEntry = {
	subListId: string;
	name: string;
	listItemIds: string[];
};

test.describe("SubListTabBar - サブリストタブバー機能テスト", () => {
	test.beforeEach(async () => {
		await resetDatabase();
		await seedDatabase();
	});

	test.afterEach(async () => {
		await resetDatabase();
	});

	// シナリオ1: 未ログインでメインリスト表示中、サブリストが0件
	test("未ログインでサブリストが0件のとき「すべて（アクティブ）」と「＋サブリストを作成」が表示される", async ({
		page,
	}, testInfo) => {
		test.skip(
			testInfo.project.name !== "mobile-webkit",
			"このテストは mobile-webkit プロジェクトのみ対象",
		);
		const listId = crypto.randomUUID();
		await seedLocalStorageViaInitScript(page, { list: { listId, items: [] }, subLists: [] });
		await page.goto(`/${listId}`);

		await expect(page.getByRole("link", { name: "すべて" })).toBeVisible();
		await expect(
			page.getByRole("button", { name: "サブリストを作成" }),
		).toBeVisible();

		// 「すべて」がアクティブ状態（data-active="true"）
		const allTab = page.getByRole("link", { name: "すべて" });
		await expect(allTab).toHaveAttribute("data-active", "true");
	});

	// シナリオ2: 未ログインでサブリストが2件ある場合
	test("未ログインでサブリストが2件あるとき「すべて」「＋サブリストを作成」「サブリスト名×2」の順で表示される", async ({
		page,
	}, testInfo) => {
		test.skip(
			testInfo.project.name !== "mobile-webkit",
			"このテストは mobile-webkit プロジェクトのみ対象",
		);
		const listId = crypto.randomUUID();
		const subLists: SubListEntry[] = [
			{ subListId: crypto.randomUUID(), name: "アクション", listItemIds: [] },
			{ subListId: crypto.randomUUID(), name: "ドラマ", listItemIds: [] },
		];
		await seedLocalStorageViaInitScript(page, { list: { listId, items: [] }, subLists });
		await page.goto(`/${listId}`);

		const tabBar = page.getByTestId("sublist-tab-bar");
		await expect(tabBar).toBeVisible();

		const tabs = tabBar.getByRole("link");
		const firstTabText = await tabs.nth(0).textContent();
		expect(firstTabText).toContain("すべて");

		await expect(
			page.getByRole("button", { name: "サブリストを作成" }),
		).toBeVisible();
		await expect(page.getByRole("link", { name: "アクション" })).toBeVisible();
		await expect(page.getByRole("link", { name: "ドラマ" })).toBeVisible();
	});

	// シナリオ3: 未ログインでサブリスト表示中
	test("未ログインでサブリスト表示中は当該タブがアクティブで「すべて」は非アクティブ", async ({
		page,
	}, testInfo) => {
		test.skip(
			testInfo.project.name !== "mobile-webkit",
			"このテストは mobile-webkit プロジェクトのみ対象",
		);
		const listId = crypto.randomUUID();
		const subListId = crypto.randomUUID();
		const subLists: SubListEntry[] = [
			{ subListId, name: "アクション", listItemIds: [] },
		];
		await seedLocalStorageViaInitScript(page, { list: { listId, items: [] }, subLists });
		await page.goto(`/${subListId}`);

		const allTab = page.getByRole("link", { name: "すべて" });
		await expect(allTab).toHaveAttribute("data-active", "false");

		const subListTab = page.getByRole("link", { name: "アクション" });
		await expect(subListTab).toHaveAttribute("data-active", "true");
	});

	// シナリオ4: ログイン済みでサブリスト一覧が取得できる場合
	test("ログイン済みでサブリスト一覧が取得できるとき「すべて」「＋サブリストを作成」「サブリスト名」の順で表示される", async ({
		page,
		context,
	}, testInfo) => {
		test.skip(
			testInfo.project.name !== "mobile-webkit",
			"このテストは mobile-webkit プロジェクトのみ対象",
		);
		const baseUrl = "http://localhost:3000";
		const { userId } = await setupAuthenticatedUser(
			context,
			"Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
			baseUrl,
		);

		// ユーザーのリストを取得
		const [list] = await db
			.select({ id: listsTable.id, publicId: listsTable.publicId })
			.from(listsTable)
			.where(
				(await import("drizzle-orm")).eq(listsTable.userId, userId),
			);

		// サブリストをDBに追加
		const subListPublicId = crypto.randomUUID();
		await db.insert(subListsTable).values({
			publicId: subListPublicId,
			listId: list.id,
			name: "お気に入り",
			createdAt: new Date(),
		});

		await page.goto(`/${list.publicId}`);

		const tabBar = page.getByTestId("sublist-tab-bar");
		await expect(tabBar).toBeVisible();

		await expect(page.getByRole("link", { name: "すべて" })).toBeVisible();
		await expect(
			page.getByRole("button", { name: "サブリストを作成" }),
		).toBeVisible();
		await expect(page.getByRole("link", { name: "お気に入り" })).toBeVisible();
	});

	// シナリオ5: 「＋サブリストを作成」クリックで SubListCreateModal が開く
	test("「＋サブリストを作成」をクリックすると SubListCreateModal が開く", async ({
		page,
	}, testInfo) => {
		test.skip(
			testInfo.project.name !== "mobile-webkit",
			"このテストは mobile-webkit プロジェクトのみ対象",
		);
		const listId = crypto.randomUUID();
		await seedLocalStorageViaInitScript(page, { list: { listId, items: [] }, subLists: [] });
		await page.goto(`/${listId}`);

		await page.getByRole("button", { name: "サブリストを作成" }).click();
		await expect(
			page.getByRole("heading", { name: "新しいサブリストを作成" }),
		).toBeVisible();
	});
});
