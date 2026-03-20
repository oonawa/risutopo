"use server";

import crypto from "node:crypto";
import { headers, cookies } from "next/headers";
import { db } from "@/db/client";
import { eq, inArray } from "drizzle-orm";
import {
	usersTable,
	userEmailsTable,
	listsTable,
	listItemMovieMatchTable,
	listItemsTable,
	sessionTokensTable,
	streamingServicesTable,
	tempSessionTokensTable,
	watchedItemsTable,
} from "@/db/schema";
import type { Result } from "@/features/shared/types/Result";
import { userIdSchema } from "../schemas/userIdSchema";
import { listItemSchema } from "@/features/shared/schemas/listItemSchema";
import {
	registerLocalListPayloadSchema,
	type RegisterLocalListInput,
} from "@/features/user/schemas/listItemSchema";
import {
	verifyTempSessionToken,
	generateSessionToken,
	addDays,
} from "@/features/auth/services/session";
import { generateDeviceId } from "@/features/auth/services/devices";

const emptyLocalList: RegisterLocalListInput = {
	listId: "",
	items: [],
};

const normalizeCreatedAt = (value: Date, fallback: Date): Date => {
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? fallback : date;
};

export async function registerUser({
	email,
	userId,
	tempToken,
	localUserList,
	now,
}: {
	email: string;
	userId: string;
	tempToken: string;
	localUserList: RegisterLocalListInput;
	now: Date;
}): Promise<Result<{ userId: string; listPublicId: string }>> {
	const tempSession = await verifyTempSessionToken({ tempToken, now });

	if (!tempSession) {
		return {
			success: false,
			error: {
				code: "UNAUTHORIZED_ERROR",
				message: "セッションが無効です。最初からやり直してください。",
			},
		};
	}

	if (tempSession.email !== email) {
		return {
			success: false,
			error: {
				code: "UNAUTHORIZED_ERROR",
				message: "メールアドレスが一致しません。",
			},
		};
	}

	const { error, data } = userIdSchema.safeParse({ userId });

	if (error) {
		return {
			success: false,
			error: {
				code: "VALIDATION_ERROR",
				message: error.message,
			},
		};
	}

	const headersList = await headers();
	const userAgent = headersList.get("user-agent") || "Unknown";
	const deviceId = generateDeviceId(userAgent);
	const parsedLocalList =
		registerLocalListPayloadSchema.safeParse(localUserList);
	const normalizedLocalList = parsedLocalList.success
		? parsedLocalList.data
		: emptyLocalList;
	const validLocalListItems = normalizedLocalList.items.flatMap((item) => {
		const parsedItem = listItemSchema.safeParse(item);
		if (!parsedItem.success) {
			return [];
		}

		return [parsedItem.data];
	});

	let transactionResult: {
		id: number;
		publicId: string;
		listPublicId: string;
		sessionToken: string;
		expiresAt: Date;
	};

	try {
		transactionResult = await db.transaction(async (tx) => {
			const [newUser] = await tx
				.insert(usersTable)
				.values({
					publicId: data.userId,
				})
				.returning({
					id: usersTable.id,
					publicId: usersTable.publicId,
				});

			await tx.insert(userEmailsTable).values({
				userId: newUser.id,
				email,
			});

			const normalizedListPublicId =
				normalizedLocalList.listId.length > 0
					? normalizedLocalList.listId
					: crypto.randomUUID();
			const [newList] = await tx
				.insert(listsTable)
				.values({
					publicId: normalizedListPublicId,
					userId: newUser.id,
				})
				.returning({
					id: listsTable.id,
					publicId: listsTable.publicId,
				});

			if (validLocalListItems.length > 0) {
				const serviceSlugs = Array.from(
					new Set(validLocalListItems.map((item) => item.serviceSlug)),
				);
				const streamingServices = await tx
					.select({
						id: streamingServicesTable.id,
						slug: streamingServicesTable.slug,
					})
					.from(streamingServicesTable)
					.where(inArray(streamingServicesTable.slug, serviceSlugs));

				const serviceIdBySlug = new Map(
					streamingServices.map((service) => [service.slug, service.id]),
				);
				const seenWatchUrls = new Set<string>();
				const listItems: Array<typeof listItemsTable.$inferInsert> = [];
				const movieIdsByPublicId = new Map<string, number>();
				const watchedAtByPublicId = new Map<string, Date>();

				for (const item of validLocalListItems) {
					if (seenWatchUrls.has(item.url)) {
						continue;
					}

					const streamingServiceId = serviceIdBySlug.get(item.serviceSlug);
					if (!streamingServiceId) {
						continue;
					}

					seenWatchUrls.add(item.url);
					listItems.push({
						publicId: item.listItemId,
						listId: newList.id,
						streamingServiceId,
						watchUrl: item.url,
						titleOnService: item.title,
						createdAt: normalizeCreatedAt(item.createdAt, now),
					});

					if (item.details) {
						movieIdsByPublicId.set(item.listItemId, item.details.movieId);
					}

					if (item.isWatched) {
						watchedAtByPublicId.set(item.listItemId, item.watchedAt);
					}
				}

				if (listItems.length > 0) {
					const insertedListItems = await tx
						.insert(listItemsTable)
						.values(listItems)
						.returning({
							id: listItemsTable.id,
							publicId: listItemsTable.publicId,
							createdAt: listItemsTable.createdAt,
						});

					const matchedMovies = insertedListItems.flatMap((item) => {
						const movieId = movieIdsByPublicId.get(item.publicId);
						if (movieId === undefined) {
							return [];
						}

						return [{ listItemId: item.id, movieId }];
					});

					if (matchedMovies.length > 0) {
						await tx.insert(listItemMovieMatchTable).values(matchedMovies);
					}

					const watchedItems = insertedListItems.flatMap((item) => {
						const watchedAt = watchedAtByPublicId.get(item.publicId);
						if (watchedAt === undefined) {
							return [];
						}

						return [{ listItemId: item.id, watchedAt }];
					});

					if (watchedItems.length > 0) {
						await tx.insert(watchedItemsTable).values(watchedItems);
					}
				}
			}

			const cookieStore = await cookies();
			const tempToken = cookieStore.get("temp_session_token")?.value;

			if (tempToken) {
				await tx
					.delete(tempSessionTokensTable)
					.where(eq(tempSessionTokensTable.token, tempToken));
			}

			const sessionToken = await generateSessionToken({
				userId: newUser.id,
				email,
				deviceId,
			});
			const expiresAt = addDays(now, 30);

			await tx.insert(sessionTokensTable).values({
				token: sessionToken,
				deviceId,
				email,
				userId: newUser.id,
				expiresAt: expiresAt,
				createdAt: now,
			});

			return {
				id: newUser.id,
				publicId: newUser.publicId,
				listPublicId: newList.publicId,
				sessionToken,
				expiresAt,
			};
		});

		const cookieStore = await cookies();
		cookieStore.set("session_token", transactionResult.sessionToken, {
			httpOnly: true,
			secure: true,
			sameSite: "lax",
			expires: transactionResult.expiresAt,
		});
	} catch (err) {
		console.error(err);
		return {
			success: false,
			error: {
				code: "INTERNAL_ERROR",
				message: "ユーザー登録の処理に失敗しました。",
			},
		};
	}

	return {
		success: true,
		data: {
			userId: transactionResult.publicId,
			listPublicId: transactionResult.listPublicId,
		},
	};
}
