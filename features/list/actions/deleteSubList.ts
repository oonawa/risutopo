"use server";

import z from "zod";

import { currentUserId } from "@/features/shared/actions/currentUserId";
import type { Result } from "@/features/shared/types/Result";
import { deleteSubListService } from "../services/deleteSubListService";

const deleteSubListSchema = z.object({
	subListPublicId: z.uuid(),
});

export async function deleteSubList({
	subListPublicId,
}: {
	subListPublicId: string;
}): Promise<Result> {
	const parsed = deleteSubListSchema.safeParse({ subListPublicId });

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

	return await deleteSubListService({
		subListPublicId: parsed.data.subListPublicId,
		userId: authResult.data.userId,
	});
}
