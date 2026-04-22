"use server";

import z from "zod";
import type { Result } from "@/features/shared/types/Result";
import { currentUserId } from "@/features/shared/actions/currentUserId";
import { userListIdAndPublicListId } from "../repositories/server/listRepository";
import { createSubListService } from "../services/createSubListService";

const createSubListSchema = z.object({
	publicListId: z.uuid(),
	name: z.string().min(1).max(50),
});

export async function createSubList({
	publicListId,
	name,
}: {
	publicListId: string;
	name: string;
}): Promise<Result<{ subListPublicId: string }>> {
	const parsed = createSubListSchema.safeParse({ publicListId, name });

	if (!parsed.success) {
		return {
			success: false,
			error: {
				code: "VALIDATION_ERROR",
				message: "不正なリクエストです。",
			},
		};
	}

	const authResult = await currentUserId();

	if (!authResult.success) {
		return {
			success: false,
			error: {
				code: "UNAUTHORIZED_ERROR",
				message: "ログインかユーザー登録をしてください。",
			},
		};
	}

	const list = await userListIdAndPublicListId(authResult.data.userId);

	if (!list || list.publicListId !== parsed.data.publicListId) {
		return {
			success: false,
			error: {
				code: "NOT_FOUND_ERROR",
				message: "リストが見つかりませんでした。",
			},
		};
	}

	const serviceResult = await createSubListService({
		listId: list.id,
		name: parsed.data.name,
	});

	if (!serviceResult.success) {
		return serviceResult;
	}

	return {
		success: true,
		data: { subListPublicId: serviceResult.data.publicId },
	};
}
