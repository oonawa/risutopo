import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/db/client";
import {
	listItemsTable,
	listsTable,
	streamingServicesTable,
	subListItemsTable,
	subListsTable,
	usersTable,
} from "@/db/schema";
import { syncUserListService } from "./syncUserListService";
import type { ListItem } from "@/features/list/types/ListItem";
import type { LocalSubList } from "@/features/user/schemas/localListSchema";

async function findStreamingServiceIdBySlug(slug: "netflix" | "hulu") {
	const [streamingService] = await db
		.select({ id: streamingServicesTable.id })
		.from(streamingServicesTable)
		.where(eq(streamingServicesTable.slug, slug));

	if (!streamingService) {
		throw Error(`streaming_services_table に ${slug} が存在しません`);
	}

	return streamingService.id;
}

function makeListItem(overrides?: { title?: string; url?: string }): ListItem {
	return {
		listItemId: crypto.randomUUID(),
		title: overrides?.title ?? "テスト作品",
		url: overrides?.url ?? `https://www.netflix.com/watch/${crypto.randomUUID()}`,
		serviceSlug: "netflix",
		serviceName: "Netflix",
		isWatched: false,
		watchedAt: null,
		createdAt: new Date(),
	};
}

describe("syncUserListService - サブリスト同期", () => {
	let listId = 0;

	beforeEach(async () => {
		await db.delete(subListItemsTable);
		await db.delete(subListsTable);
		await db.delete(listItemsTable);
		await db.delete(listsTable);
		await db.delete(usersTable);

		await findStreamingServiceIdBySlug("netflix");

		const [user] = await db
			.insert(usersTable)
			.values({ publicId: "sync-service-test-user" })
			.returning({ id: usersTable.id });

		const [list] = await db
			.insert(listsTable)
			.values({ publicId: crypto.randomUUID(), userId: user.id })
			.returning({ id: listsTable.id });

		listId = list.id;
	});

	it("subListsなしで成功する（後方互換）", async () => {
		const item = makeListItem();
		const result = await syncUserListService({
			listId,
			items: [item],
			subLists: [],
		});

		expect(result.success).toBe(true);
	});

	it("サブリストをDBへ同期する", async () => {
		const item = makeListItem();
		const subList: LocalSubList = {
			subListId: crypto.randomUUID(),
			name: "お気に入り",
			listItemIds: [item.listItemId],
		};

		const result = await syncUserListService({
			listId,
			items: [item],
			subLists: [subList],
		});

		expect(result.success).toBe(true);

		const storedSubLists = await db
			.select()
			.from(subListsTable)
			.where(eq(subListsTable.listId, listId));

		expect(storedSubLists).toHaveLength(1);
		expect(storedSubLists[0]?.name).toBe("お気に入り");

		const firstSubList = storedSubLists[0];
		if (!firstSubList) throw new Error("サブリストが見つかりません");

		const storedSubListItems = await db
			.select()
			.from(subListItemsTable)
			.where(eq(subListItemsTable.subListId, firstSubList.id));

		expect(storedSubListItems).toHaveLength(1);
	});

	it("サブリストのアイテムがitemsに存在しない場合はスキップする", async () => {
		const item = makeListItem();
		const unknownId = crypto.randomUUID();
		const subList: LocalSubList = {
			subListId: crypto.randomUUID(),
			name: "不明なアイテム含む",
			listItemIds: [item.listItemId, unknownId],
		};

		const result = await syncUserListService({
			listId,
			items: [item],
			subLists: [subList],
		});

		expect(result.success).toBe(true);

		const storedSubLists = await db
			.select()
			.from(subListsTable)
			.where(eq(subListsTable.listId, listId));

		expect(storedSubLists).toHaveLength(1);

		const secondFirstSubList = storedSubLists[0];
		if (!secondFirstSubList) throw new Error("サブリストが見つかりません");

		const storedSubListItems = await db
			.select()
			.from(subListItemsTable)
			.where(eq(subListItemsTable.subListId, secondFirstSubList.id));

		// unknownId のアイテムはスキップされ1件のみ
		expect(storedSubListItems).toHaveLength(1);
	});

	it("複数のサブリストを一括で同期する", async () => {
		const item1 = makeListItem({ title: "作品1" });
		const item2 = makeListItem({ title: "作品2" });
		const subList1: LocalSubList = {
			subListId: crypto.randomUUID(),
			name: "サブリストA",
			listItemIds: [item1.listItemId],
		};
		const subList2: LocalSubList = {
			subListId: crypto.randomUUID(),
			name: "サブリストB",
			listItemIds: [item2.listItemId],
		};

		const result = await syncUserListService({
			listId,
			items: [item1, item2],
			subLists: [subList1, subList2],
		});

		expect(result.success).toBe(true);

		const storedSubLists = await db
			.select()
			.from(subListsTable)
			.where(eq(subListsTable.listId, listId));

		expect(storedSubLists).toHaveLength(2);
	});
});
