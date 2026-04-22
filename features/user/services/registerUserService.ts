import crypto from "node:crypto";
import type { Result } from "@/features/shared/types/Result";
import type { ListItem } from "@/features/list/types/ListItem";
import type { LocalSubList } from "@/features/user/schemas/localListSchema";
import { db } from "@/db/client";
import { listsTable, sessionTokensTable } from "@/db/schema";
import { generateSessionToken } from "@/features/shared/lib/jwt";
import { syncUserListService } from "@/features/list/services/syncUserListService";
import { insertUser } from "../repositories/userRepository";
import { replaceUserEmail } from "../repositories/userEmailRepository";

export async function registerUserService({
	email,
	publicUserId,
	deviceId,
	now,
	items,
	subLists,
}: {
	email: string;
	publicUserId: string;
	deviceId: string;
	now: Date;
	items: ListItem[];
	subLists: LocalSubList[];
}): Promise<
	Result<{ publicListId: string; sessionToken: string; expiresAt: Date }>
> {
	try {
		const { newListId, publicListId, sessionToken, expiresAt } =
			await db.transaction(async (tx) => {
				const newUser = await insertUser({ tx, publicId: publicUserId });

				if (!newUser) {
					throw new Error("ユーザー作成に失敗しました");
				}

				await replaceUserEmail({ tx, userId: newUser.id, email });

				const [newList] = await tx
					.insert(listsTable)
					.values({
						publicId: crypto.randomUUID(),
						userId: newUser.id,
					})
					.returning({
						id: listsTable.id,
						publicId: listsTable.publicId,
					});

				if (!newList) {
					throw new Error("リスト作成に失敗しました");
				}

				const token = await generateSessionToken({
					userId: newUser.id,
					deviceId,
				});
				const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

				await tx.insert(sessionTokensTable).values({
					token,
					deviceId,
					userId: newUser.id,
					expiresAt,
					createdAt: now,
				});

				return {
					newListId: newList.id,
					publicListId: newList.publicId,
					sessionToken: token,
					expiresAt,
				};
			});

		if (items.length > 0 || subLists.length > 0) {
			await syncUserListService({
				listId: newListId,
				items,
				subLists,
			});
		}

		return {
			success: true,
			data: { publicListId, sessionToken, expiresAt },
		};
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
}
