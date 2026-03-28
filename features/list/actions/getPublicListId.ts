"use server";

import type { Result } from "@/features/shared/types/Result";
import { getPublicListIdService } from "../services/getPublicListIdService";

export async function getPublicListId(
	userId: number,
): Promise<Result<{ publicListId: string }>> {
	const publicListId = await getPublicListIdService(userId);

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
