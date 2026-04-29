import crypto from "node:crypto";
import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/db/client";
import {
	listsTable,
	subListsTable,
	usersTable,
} from "@/db/schema";
import { createSubListService } from "./createSubListService";

describe("createSubListService", () => {
	let listId = 0;

	beforeEach(async () => {
		await db.delete(subListsTable);
		await db.delete(listsTable);
		await db.delete(usersTable);

		const [user] = await db
			.insert(usersTable)
			.values({ publicId: "create-sub-list-service-user" })
			.returning({ id: usersTable.id });

		const [list] = await db
			.insert(listsTable)
			.values({ publicId: crypto.randomUUID(), userId: user.id })
			.returning({ id: listsTable.id });

		listId = list.id;
	});

	it("サブリストを作成してpublicIdを返す", async () => {
		const result = await createSubListService({ listId, name: "新しいサブリスト" });

		expect(result.success).toBe(true);

		if (!result.success) return;

		expect(result.data.publicId).toBeTypeOf("string");
		expect(result.data.publicId).toMatch(
			/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
		);
	});

	it("同じリストに複数のサブリストを作成できる", async () => {
		const result1 = await createSubListService({ listId, name: "サブリストA" });
		const result2 = await createSubListService({ listId, name: "サブリストB" });

		expect(result1.success).toBe(true);
		expect(result2.success).toBe(true);

		if (!result1.success || !result2.success) return;

		expect(result1.data.publicId).not.toBe(result2.data.publicId);
	});
});
