import crypto from "node:crypto";
import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/db/client";
import {
	listItemsTable,
	listsTable,
	sessionTokensTable,
	subListItemsTable,
	subListsTable,
	tempSessionTokensTable,
	userEmailsTable,
	usersTable,
} from "@/db/schema";
import { registerUserService } from "./registerUserService";
import type { ListItem } from "@/features/list/types/ListItem";
import type { LocalSubList } from "@/features/user/schemas/localListSchema";

const now = new Date("2026-02-16T00:00:00.000Z");

function makeListItem(overrides?: { title?: string }): ListItem {
	return {
		listItemId: crypto.randomUUID(),
		title: overrides?.title ?? "テスト作品",
		url: `https://www.netflix.com/watch/${crypto.randomUUID()}`,
		serviceSlug: "netflix",
		serviceName: "Netflix",
		isWatched: false,
		watchedAt: null,
		createdAt: now,
	};
}

describe("registerUserService", () => {
	const email = "register-service-test@example.com";

	beforeEach(async () => {
		await db.delete(subListItemsTable);
		await db.delete(subListsTable);
		await db.delete(listItemsTable);
		await db.delete(sessionTokensTable);
		await db.delete(listsTable);
		await db.delete(userEmailsTable);
		await db.delete(usersTable);
		await db.delete(tempSessionTokensTable);
	});

	it("ユーザーを作成してpublicListIdとsessionTokenを返す", async () => {
		const publicUserId = crypto.randomUUID();

		const result = await registerUserService({
			email,
			publicUserId,
			deviceId: "test-device-id",
			now,
			items: [],
			subLists: [],
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.publicListId).toBeTruthy();
			expect(result.data.sessionToken).toBeTruthy();
			expect(result.data.expiresAt).toBeInstanceOf(Date);
		}
	});

	it("メインリストのアイテムを同期する", async () => {
		const publicUserId = crypto.randomUUID();
		const item = makeListItem();

		const result = await registerUserService({
			email,
			publicUserId,
			deviceId: "test-device-id",
			now,
			items: [item],
			subLists: [],
		});

		expect(result.success).toBe(true);

		const storedItems = await db.select().from(listItemsTable);
		expect(storedItems).toHaveLength(1);
		expect(storedItems[0]?.titleOnService).toBe("テスト作品");
	});

	it("サブリストを同期する", async () => {
		const publicUserId = crypto.randomUUID();
		const item = makeListItem({ title: "サブリスト作品" });
		const subList: LocalSubList = {
			subListId: crypto.randomUUID(),
			name: "お気に入り",
			listItemIds: [item.listItemId],
		};

		const result = await registerUserService({
			email,
			publicUserId,
			deviceId: "test-device-id",
			now,
			items: [item],
			subLists: [subList],
		});

		expect(result.success).toBe(true);

		const storedSubLists = await db.select().from(subListsTable);
		expect(storedSubLists).toHaveLength(1);
		expect(storedSubLists[0]?.name).toBe("お気に入り");

		const storedSubListItems = await db.select().from(subListItemsTable);
		expect(storedSubListItems).toHaveLength(1);
	});
});
