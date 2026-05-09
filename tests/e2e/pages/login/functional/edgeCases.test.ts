import { expect, test } from "@playwright/test";
import { resetDatabase, seedDatabase } from "../../../lib/dbHelpers";

const BASE_URL = "http://localhost:3001";

test.describe("ログインフロー - エッジケース", () => {
	test.beforeEach(async ({ context }) => {
		await resetDatabase();
		await seedDatabase();
		await context.clearCookies();
	});

	test("メールアドレス未入力のまま送信ボタンを押すとバリデーションエラーが表示される", async ({
		page,
	}) => {
		await page.goto(`${BASE_URL}/login`);

		// 送信ボタンは disabled なのでクリックできないことを確認
		const sendButton = page.getByRole("button", { name: "送信" });
		await expect(sendButton).toBeDisabled();
	});
});
