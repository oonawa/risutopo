"use server";

import type { Result } from "@/features/shared/types/Result";
import { getUserMovieListPublicIdService } from "../services/getUserListPublicIdService";

export async function getUserMovieListPublicId(
	userId: number,
): Promise<Result<{ publicListId: string }>> {
	const publicListId = await getUserMovieListPublicIdService(userId);

	if (!publicListId) {
		return {
			success: false,
			error: {
				code: "NOT_FOUND_ERROR",
				message: "リストが見つかりませんでした。",
			},
		};
	}

	return {
		success: true,
		data: {
			publicListId,
		},
	};
}
