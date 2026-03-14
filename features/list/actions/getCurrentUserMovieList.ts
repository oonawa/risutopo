"use server";

import z from "zod";
import type { Result } from "@/features/shared/types/Result";
import type { ListItem } from "@/features/list/types/ListItem";
import { getUserListService } from "../services/getUserListService";
import { currentUserId } from "@/features/shared/actions/currentUserId";

const getCurrentUserMovieListSchema = z.object({
	listPublicId: z.uuid(),
});

export async function getCurrentUserMovieList(
	listPublicId: string,
): Promise<Result<ListItem[]>> {
	const parsed = getCurrentUserMovieListSchema.safeParse({ listPublicId });

	if (!parsed.success) {
		return {
			success: false,
			error: {
				code: "VALIDATION_ERROR",
				message: "不正なリクエストです。",
			},
		};
	}

	const result = await currentUserId();

	if (!result.success) {
		return {
			success: false,
			error: {
				code: "UNAUTHORIZED_ERROR",
				message: "",
			},
		};
	}

	return await getUserListService(listPublicId, result.data.userId);
}
