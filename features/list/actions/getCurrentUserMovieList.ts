"use server";

import { isAuthenticated } from "@/features/auth/services/session";
import type { Result } from "@/features/shared/types/Result";
import type { ListItem } from "@/features/list/types/ListItem";
import { getUserMovieList as getUserMovieListService } from "../services/listQueryService";

export async function getCurrentUserMovieList(
	listPublicId: string,
): Promise<Result<ListItem[]>> {
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

	return await getUserMovieListService(listPublicId, payload.userId);
}
