"use server";

import z from "zod";
import type { Result } from "@/features/shared/types/Result";
import type { ListItem } from "@/features/list/types/ListItem";
import { getUserListService } from "../services/getUserListService";

const getUserMovieListSchema = z.object({
	listPublicId: z.uuid(),
	userId: z.int(),
});

export async function getUserMovieList(
	listPublicId: string,
	userId: number,
): Promise<Result<ListItem[]>> {
	const parsed = getUserMovieListSchema.safeParse({ listPublicId, userId });

	if (!parsed.success) {
		return {
			success: false,
			error: {
				code: "VALIDATION_ERROR",
				message: "不正なリクエストです。",
			},
		};
	}

	return await getUserListService(listPublicId, userId);
}
