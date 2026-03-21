import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/db/client";
import {
	listItemMovieMatchTable,
	listItemsTable,
	listsTable,
	moviesTable,
	streamingServicesTable,
	usersTable,
	watchedItemsTable,
} from "@/db/schema";
import type { Result } from "@/features/shared/types/Result";
import type { ListItem } from "../types/ListItem";
import { syncUserList } from "./syncUserList";

const { mockCurrentUserId } = vi.hoisted(() => ({
	mockCurrentUserId: vi.fn(),
}));

vi.mock("@/features/shared/actions/currentUserId", () => ({
	currentUserId: mockCurrentUserId,
}));

async function findStreamingServiceIdBySlug(slug: ListItem["serviceSlug"]) {
	const [streamingService] = await db
		.select({ id: streamingServicesTable.id })
		.from(streamingServicesTable)
		.where(eq(streamingServicesTable.slug, slug));

	expect(streamingService).toBeDefined();

	if (!streamingService) {
		throw Error(`streaming_services_table に ${slug} が存在しません`);
	}

	return streamingService.id;
}

function createListItem({
	title,
	url,
	serviceSlug,
	serviceName,
	createdAt,
	isWatched,
	watchedAt,
	details,
}: {
	title: string;
	url: string;
	serviceSlug: ListItem["serviceSlug"];
	serviceName: ListItem["serviceName"];
	createdAt: Date;
	isWatched: boolean;
	watchedAt: Date | null;
	details?: ListItem["details"];
}): ListItem {
	if (isWatched && watchedAt) {
		return {
			listItemId: crypto.randomUUID(),
			title,
			url,
			serviceSlug,
			serviceName,
			createdAt,
			isWatched: true,
			watchedAt,
			details,
		};
	}

	return {
		listItemId: crypto.randomUUID(),
		title,
		url,
		serviceSlug,
		serviceName,
		createdAt,
		isWatched: false,
		watchedAt: null,
		details,
	};
}

async function insertMovie({
	externalDatabaseMovieId,
	title,
}: {
	externalDatabaseMovieId: number;
	title: string;
}) {
	const [movie] = await db
		.insert(moviesTable)
		.values({
			externalDatabaseMovieId: externalDatabaseMovieId.toString(),
			title,
			overview: `${title} の概要`,
			backgroundImage: `https://example.com/${externalDatabaseMovieId}/bg.jpg`,
			posterImage: `https://example.com/${externalDatabaseMovieId}/poster.jpg`,
			runningMinutes: 120,
			releaseDate: "2024-01-01",
		})
		.returning({ id: moviesTable.id });

	return movie.id;
}

async function insertExistingListItem({
	listId,
	item,
	movieId,
	watchedAt,
}: {
	listId: number;
	item: ListItem;
	movieId?: number;
	watchedAt?: Date;
}) {
	const streamingServiceId = await findStreamingServiceIdBySlug(
		item.serviceSlug,
	);
	const [insertedListItem] = await db
		.insert(listItemsTable)
		.values({
			publicId: item.listItemId,
			listId,
			streamingServiceId,
			watchUrl: item.url,
			titleOnService: item.title,
			createdAt: item.createdAt,
		})
		.returning({ id: listItemsTable.id });

	if (movieId !== undefined) {
		await db.insert(listItemMovieMatchTable).values({
			listItemId: insertedListItem.id,
			movieId,
		});
	}

	if (watchedAt !== undefined) {
		await db.insert(watchedItemsTable).values({
			listItemId: insertedListItem.id,
			watchedAt,
		});
	}

	return insertedListItem.id;
}

function expectSyncSuccess(
	result: Result<{ publicListId: string }>,
): { publicListId: string } {
	if (!result.success) {
		throw new Error(
			`syncUserList が失敗しました: ${result.error.code} ${result.error.message}`,
		);
	}

	return result.data;
}

describe("syncUserList", () => {
	let userId = 0;
	let listId = 0;
	let listPublicId = "";

	beforeEach(async () => {
		mockCurrentUserId.mockReset();

		await db.delete(watchedItemsTable);
		await db.delete(listItemMovieMatchTable);
		await db.delete(listItemsTable);
		await db.delete(listsTable);
		await db.delete(moviesTable);
		await db.delete(usersTable);

		const [user] = await db
			.insert(usersTable)
			.values({
				publicId: crypto.randomUUID(),
			})
			.returning({ id: usersTable.id });

		userId = user.id;

		const [list] = await db
			.insert(listsTable)
			.values({
				publicId: crypto.randomUUID(),
				userId,
			})
			.returning({
				id: listsTable.id,
				publicId: listsTable.publicId,
			});

		listId = list.id;
		listPublicId = list.publicId;

		mockCurrentUserId.mockResolvedValue({
			success: true,
			data: { userId },
		});
	});

	it("既存ユーザーは、ログイン時にDBをローカルのリストと同期できる", async () => {
		const unwatchedItem = createListItem({
			title: "新規映画A",
			url: "https://www.netflix.com/jp/title/80100172",
			serviceSlug: "netflix",
			serviceName: "Netflix",
			createdAt: new Date("2026-03-20T00:00:00.000Z"),
			isWatched: false,
			watchedAt: null,
		});
		const movieId = await insertMovie({
			externalDatabaseMovieId: 91001,
			title: "新規映画B",
		});
		const watchedAt = new Date("2026-03-19T00:00:00.000Z");
		const watchedItem = createListItem({
			title: "新規映画B",
			url: "https://www.hulu.jp/watch/sync-user-list-test",
			serviceSlug: "hulu",
			serviceName: "Hulu",
			createdAt: new Date("2026-03-19T00:00:00.000Z"),
			isWatched: true,
			watchedAt,
			details: {
				movieId,
				officialTitle: "新規映画B",
				backgroundImage: "https://example.com/91001/bg.jpg",
				posterImage: "https://example.com/91001/poster.jpg",
				director: ["監督A"],
				runningMinutes: 120,
				releaseYear: 2024,
				externalDatabaseMovieId: 91001,
				overview: "概要",
			},
		});

		const result = await syncUserList({
			localUserListItems: [unwatchedItem, watchedItem],
		});
		const data = expectSyncSuccess(result);

		expect(data.publicListId).toBe(listPublicId);

		const storedListItems = await db
			.select({
				id: listItemsTable.id,
				publicId: listItemsTable.publicId,
				watchUrl: listItemsTable.watchUrl,
				titleOnService: listItemsTable.titleOnService,
			})
			.from(listItemsTable)
			.where(eq(listItemsTable.listId, listId));

		expect(storedListItems).toHaveLength(2);
		expect(storedListItems).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					publicId: unwatchedItem.listItemId,
					watchUrl: unwatchedItem.url,
					titleOnService: unwatchedItem.title,
				}),
				expect.objectContaining({
					publicId: watchedItem.listItemId,
					watchUrl: watchedItem.url,
					titleOnService: watchedItem.title,
				}),
			]),
		);

		const watchedRecord = await db
			.select({
				publicId: listItemsTable.publicId,
				watchedAt: watchedItemsTable.watchedAt,
			})
			.from(watchedItemsTable)
			.innerJoin(
				listItemsTable,
				eq(listItemsTable.id, watchedItemsTable.listItemId),
			)
			.where(eq(listItemsTable.publicId, watchedItem.listItemId));

		expect(watchedRecord).toEqual([
			{
				publicId: watchedItem.listItemId,
				watchedAt,
			},
		]);

		const matchedMovieRecord = await db
			.select({
				publicId: listItemsTable.publicId,
				movieId: listItemMovieMatchTable.movieId,
			})
			.from(listItemMovieMatchTable)
			.innerJoin(
				listItemsTable,
				eq(listItemsTable.id, listItemMovieMatchTable.listItemId),
			)
			.where(eq(listItemsTable.publicId, watchedItem.listItemId));

		expect(matchedMovieRecord).toEqual([
			{
				publicId: watchedItem.listItemId,
				movieId,
			},
		]);
	});

	it("ローカルとDBで重複している作品は、状態が同じなら保存されない", async () => {
		const existingItem = createListItem({
			title: "既存映画",
			url: "https://www.netflix.com/jp/title/70000001",
			serviceSlug: "netflix",
			serviceName: "Netflix",
			createdAt: new Date("2026-03-18T00:00:00.000Z"),
			isWatched: false,
			watchedAt: null,
		});
		await insertExistingListItem({
			listId,
			item: existingItem,
		});

		const newItem = createListItem({
			title: "新規映画",
			url: "https://www.hulu.jp/watch/sync-user-list-new-item",
			serviceSlug: "hulu",
			serviceName: "Hulu",
			createdAt: new Date("2026-03-21T00:00:00.000Z"),
			isWatched: false,
			watchedAt: null,
		});

		const result = await syncUserList({
			localUserListItems: [
				existingItem,
				{
					...existingItem,
					listItemId: crypto.randomUUID(),
				},
				newItem,
			],
		});
		const data = expectSyncSuccess(result);

		expect(data.publicListId).toBe(listPublicId);

		const storedListItems = await db
			.select({
				publicId: listItemsTable.publicId,
				watchUrl: listItemsTable.watchUrl,
			})
			.from(listItemsTable)
			.where(eq(listItemsTable.listId, listId));

		expect(storedListItems).toHaveLength(2);
		expect(storedListItems).toEqual(
			expect.arrayContaining([
				{
					publicId: existingItem.listItemId,
					watchUrl: existingItem.url,
				},
				{
					publicId: newItem.listItemId,
					watchUrl: newItem.url,
				},
			]),
		);
	});

	it("既存作品と同一URLの作品の視聴ステータスが未視聴から視聴済みに変わっていたら、既存作品を視聴済みにする", async () => {
		const existingItem = createListItem({
			title: "既存の未視聴作品",
			url: "https://www.netflix.com/jp/title/70000002",
			serviceSlug: "netflix",
			serviceName: "Netflix",
			createdAt: new Date("2026-03-18T00:00:00.000Z"),
			isWatched: false,
			watchedAt: null,
		});
		const existingListItemId = await insertExistingListItem({
			listId,
			item: existingItem,
		});
		const changedWatchedAt = new Date("2026-03-22T00:00:00.000Z");

		const result = await syncUserList({
			localUserListItems: [
				{
					...existingItem,
					listItemId: crypto.randomUUID(),
					isWatched: true,
					watchedAt: changedWatchedAt,
				},
			],
		});
		const data = expectSyncSuccess(result);

		expect(data.publicListId).toBe(listPublicId);

		const [storedListItem] = await db
			.select({
				id: listItemsTable.id,
				publicId: listItemsTable.publicId,
			})
			.from(listItemsTable)
			.where(eq(listItemsTable.id, existingListItemId));

		expect(storedListItem).toEqual({
			id: existingListItemId,
			publicId: existingItem.listItemId,
		});

		const watchedRecords = await db
			.select()
			.from(watchedItemsTable)
			.where(eq(watchedItemsTable.listItemId, existingListItemId));

		expect(watchedRecords).toEqual([
			{
				listItemId: existingListItemId,
				watchedAt: changedWatchedAt,
			},
		]);
	});

	it("既存作品とタイトル / URLが同一の作品に詳細情報が追加されたら、既存作品と映画マスタの紐付けを追加する", async () => {
		const existingItem = createListItem({
			title: "既存の詳細未設定作品",
			url: "https://www.hulu.jp/watch/sync-user-list-existing-detail",
			serviceSlug: "hulu",
			serviceName: "Hulu",
			createdAt: new Date("2026-03-18T00:00:00.000Z"),
			isWatched: false,
			watchedAt: null,
		});
		const existingListItemId = await insertExistingListItem({
			listId,
			item: existingItem,
		});
		const movieId = await insertMovie({
			externalDatabaseMovieId: 91002,
			title: "詳細付き映画",
		});
		const duplicatedLocalItemId = crypto.randomUUID();

		const result = await syncUserList({
			localUserListItems: [
				{
					...existingItem,
					listItemId: duplicatedLocalItemId,
					details: {
						movieId,
						officialTitle: "詳細付き映画",
						backgroundImage: "https://example.com/91002/bg.jpg",
						posterImage: "https://example.com/91002/poster.jpg",
						director: ["監督B"],
						runningMinutes: 121,
						releaseYear: 2025,
						externalDatabaseMovieId: 91002,
						overview: "詳細あり",
					},
				},
			],
		});
		const data = expectSyncSuccess(result);

		expect(data.publicListId).toBe(listPublicId);
		const storedListItems = await db
			.select({
				id: listItemsTable.id,
				publicId: listItemsTable.publicId,
			})
			.from(listItemsTable)
			.where(eq(listItemsTable.listId, listId));

		expect(storedListItems).toEqual([
			{
				id: existingListItemId,
				publicId: existingItem.listItemId,
			},
		]);

		const duplicatedLocalRecords = await db
			.select({
				id: listItemsTable.id,
			})
			.from(listItemsTable)
			.where(eq(listItemsTable.publicId, duplicatedLocalItemId));

		expect(duplicatedLocalRecords).toHaveLength(0);

		const matchedMovies = await db
			.select()
			.from(listItemMovieMatchTable)
			.where(eq(listItemMovieMatchTable.listItemId, existingListItemId));

		expect(matchedMovies).toEqual([
			{
				listItemId: existingListItemId,
				movieId,
			},
		]);
	});

	it("既存の未視聴作品とタイトル / URLが同一の作品が視聴済みで追加されたら、既存作品を視聴済みにする", async () => {
		const existingItem = createListItem({
			title: "既存の未視聴作品",
			url: "https://www.netflix.com/jp/title/70000003",
			serviceSlug: "netflix",
			serviceName: "Netflix",
			createdAt: new Date("2026-03-18T00:00:00.000Z"),
			isWatched: false,
			watchedAt: null,
		});
		const existingListItemId = await insertExistingListItem({
			listId,
			item: existingItem,
		});
		const changedWatchedAt = new Date("2026-03-22T00:00:00.000Z");
		const duplicatedLocalItemId = crypto.randomUUID();

		const result = await syncUserList({
			localUserListItems: [
				{
					...existingItem,
					listItemId: duplicatedLocalItemId,
					isWatched: true,
					watchedAt: changedWatchedAt,
				},
			],
		});
		const data = expectSyncSuccess(result);

		expect(data.publicListId).toBe(listPublicId);

		const storedListItems = await db
			.select({
				id: listItemsTable.id,
				publicId: listItemsTable.publicId,
			})
			.from(listItemsTable)
			.where(eq(listItemsTable.listId, listId));

		expect(storedListItems).toEqual([
			{
				id: existingListItemId,
				publicId: existingItem.listItemId,
			},
		]);

		const duplicatedLocalRecords = await db
			.select({
				id: listItemsTable.id,
			})
			.from(listItemsTable)
			.where(eq(listItemsTable.publicId, duplicatedLocalItemId));

		expect(duplicatedLocalRecords).toHaveLength(0);

		const watchedRecords = await db
			.select()
			.from(watchedItemsTable)
			.where(eq(watchedItemsTable.listItemId, existingListItemId));

		expect(watchedRecords).toEqual([
			{
				listItemId: existingListItemId,
				watchedAt: changedWatchedAt,
			},
		]);
	});

	it("未ログイン時は例外としてUNAUTHORIZED_ERRORを返す", async () => {
		mockCurrentUserId.mockResolvedValue({
			success: false,
			error: {
				code: "UNAUTHORIZED_ERROR",
				message: "ログインしていません。",
			},
		});

		const result = await syncUserList({
			localUserListItems: [],
		});

		expect(result).toEqual({
			success: false,
			error: {
				code: "UNAUTHORIZED_ERROR",
				message: "ログイン、またはユーザー登録を行なってください。",
			},
		});
	});

	it("ローカルのリストが不正なら例外としてVALIDATION_ERRORを返す", async () => {
		const invalidItem = {
			...createListItem({
				title: "不正な作品",
				url: "https://www.netflix.com/jp/title/99999999",
				serviceSlug: "netflix",
				serviceName: "Netflix",
				createdAt: new Date("2026-03-20T00:00:00.000Z"),
				isWatched: false,
				watchedAt: null,
			}),
			watchedAt: "invalid-date",
		};

		const result = await syncUserList({
			// @ts-expect-error バリデーションエラーを検証するために不正な入力を渡す
			localUserListItems: [invalidItem],
		});

		expect(result).toEqual({
			success: false,
			error: {
				code: "VALIDATION_ERROR",
				message: "データが無効のため、リストを同期できませんでした。",
			},
		});
	});

	it("自分が持ち主ではないリストのIDを指定されたら例外としてNOT_FOUND_ERRORを返す", async () => {
		const [otherUser] = await db
			.insert(usersTable)
			.values({
				publicId: crypto.randomUUID(),
			})
			.returning({ id: usersTable.id });
		await db
			.insert(listsTable)
			.values({
				publicId: crypto.randomUUID(),
				userId: otherUser.id,
			})

		await db.delete(listsTable).where(eq(listsTable.id, listId));

		const result = await syncUserList({
			localUserListItems: [],
		});

		expect(result).toEqual({
			success: false,
			error: {
				code: "NOT_FOUND_ERROR",
				message: "同期するリストが見つかりませんでした。",
			},
		});
	});
});
