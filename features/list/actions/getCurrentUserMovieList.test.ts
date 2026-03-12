import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/db/client";
import {
	listItemsTable,
	listsTable,
	streamingServicesTable,
	usersTable,
} from "@/db/schema";
import { getCurrentUserMovieList } from "./getCurrentUserMovieList";

const { mockIsAuthenticated } = vi.hoisted(() => {
	return {
		mockIsAuthenticated: vi.fn(),
	};
});

vi.mock("@/features/auth/services/session", () => ({
	isAuthenticated: mockIsAuthenticated,
}));

async function findStreamingServiceIdBySlug(slug: "netflix" | "hulu") {
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

describe("getCurrentUserMovieList", () => {
	let userAId = 0;
	let userBId = 0;
	let userAListPublicId = "";
	let userBListPublicId = "";

	beforeEach(async () => {
		mockIsAuthenticated.mockReset();

		await db.delete(listItemsTable);
		await db.delete(listsTable);
		await db.delete(usersTable);

		const [userA] = await db
			.insert(usersTable)
			.values({
				publicId: "get-current-user-movie-list-user-a",
				email: "get-current-user-movie-list-user-a@example.com",
			})
			.returning({ id: usersTable.id });

		const [userB] = await db
			.insert(usersTable)
			.values({
				publicId: "get-current-user-movie-list-user-b",
				email: "get-current-user-movie-list-user-b@example.com",
			})
			.returning({ id: usersTable.id });

		userAId = userA.id;
		userBId = userB.id;

		userAListPublicId = crypto.randomUUID();
		userBListPublicId = crypto.randomUUID();

		const [userAList] = await db
			.insert(listsTable)
			.values({
				publicId: userAListPublicId,
				userId: userAId,
			})
			.returning({ id: listsTable.id });

		const [userBList] = await db
			.insert(listsTable)
			.values({
				publicId: userBListPublicId,
				userId: userBId,
			})
			.returning({ id: listsTable.id });

		const netflixId = await findStreamingServiceIdBySlug("netflix");
		const huluId = await findStreamingServiceIdBySlug("hulu");

		await db.insert(listItemsTable).values([
			{
				publicId: "get-current-user-movie-list-user-a-item-1",
				listId: userAList.id,
				streamingServiceId: netflixId,
				watchUrl: "https://www.netflix.com/jp/title/60002360",
				titleOnService: "ユーザーAの映画1",
				watchStatus: 0,
				createdAt: new Date("2026-03-12T00:00:00.000Z"),
				movieId: null,
			},
			{
				publicId: "get-current-user-movie-list-user-a-item-2",
				listId: userAList.id,
				streamingServiceId: huluId,
				watchUrl: "https://www.hulu.jp/watch/test-user-a",
				titleOnService: "ユーザーAの映画2",
				watchStatus: 1,
				createdAt: new Date("2026-03-11T00:00:00.000Z"),
				movieId: null,
			},
			{
				publicId: "get-current-user-movie-list-user-b-item-1",
				listId: userBList.id,
				streamingServiceId: netflixId,
				watchUrl: "https://www.netflix.com/jp/title/80100172",
				titleOnService: "ユーザーBの映画1",
				watchStatus: 0,
				createdAt: new Date("2026-03-10T00:00:00.000Z"),
				movieId: null,
			},
		]);
	});

	it("ユーザーは自身のリストアイテム全件を取得できる", async () => {
		mockIsAuthenticated.mockResolvedValue({
			userId: userAId,
			email: "get-current-user-movie-list-user-a@example.com",
			deviceId: "test-device-id",
		});

		const result = await getCurrentUserMovieList(userAListPublicId);

		expect(mockIsAuthenticated).toHaveBeenCalledTimes(1);
		expect(result).toEqual({
			success: true,
			data: [
				{
					listItemId: "get-current-user-movie-list-user-a-item-2",
					title: "ユーザーAの映画2",
					url: "https://www.hulu.jp/watch/test-user-a",
					serviceSlug: "hulu",
					serviceName: "Hulu",
					isWatched: true,
					createdAt: new Date("2026-03-11T00:00:00.000Z"),
				},
				{
					listItemId: "get-current-user-movie-list-user-a-item-1",
					title: "ユーザーAの映画1",
					url: "https://www.netflix.com/jp/title/60002360",
					serviceSlug: "netflix",
					serviceName: "Netflix",
					isWatched: false,
					createdAt: new Date("2026-03-12T00:00:00.000Z"),
				},
			],
		});
	});

	it("ユーザーは他ユーザーのリストアイテムを取得できない", async () => {
		mockIsAuthenticated.mockResolvedValue({
			userId: userAId,
			email: "get-current-user-movie-list-user-a@example.com",
			deviceId: "test-device-id",
		});

		const result = await getCurrentUserMovieList(userBListPublicId);

		expect(result).toEqual({
			success: false,
			error: {
				code: "NOT_FOUND_ERROR",
				message: "リストが見つかりませんでした。",
			},
		});
	});

	it("ユーザーはログイン中でなければリストアイテムを取得できない", async () => {
		mockIsAuthenticated.mockResolvedValue(null);

		const result = await getCurrentUserMovieList(userAListPublicId);

		expect(mockIsAuthenticated).toHaveBeenCalledTimes(1);
		expect(result).toEqual({
			success: false,
			error: {
				code: "UNAUTHORIZED_ERROR",
				message: "",
			},
		});
	});

	it("ユーザーは存在しないリストからリストアイテムを取得できない", async () => {
		mockIsAuthenticated.mockResolvedValue({
			userId: userAId,
			email: "get-current-user-movie-list-user-a@example.com",
			deviceId: "test-device-id",
		});

		const result = await getCurrentUserMovieList(crypto.randomUUID());

		expect(result).toEqual({
			success: false,
			error: {
				code: "NOT_FOUND_ERROR",
				message: "リストが見つかりませんでした。",
			},
		});
	});
});
