"use server";

import z from "zod";
import { isAuthenticated } from "@/features/auth/services/session";
import type { Result } from "@/features/shared/types/Result";
import type { ListItem } from "@/features/list/types/ListItem";
import { getUserListService } from "../services/getUserListService";

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

	const payload = await isAuthenticated();

	if (!payload) {
		return {
			success: false,
			error: {
				code: "UNAUTHORIZED_ERROR",
				message: "",
			},
		};
	}

	return await getUserListService(listPublicId, payload.userId);
}
