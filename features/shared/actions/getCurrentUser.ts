"use server";

import { cache } from "react";
import type { Result } from "../types/Result";
import { currentUserId } from "./currentUserId";
import { currentUserPublicListId } from "./currentUserPublicListId";
import { currentUserEmail } from "./currentUserEmail";

export const getCurrentUser = cache(
	async (): Promise<Result<{ publicListId: string; email: string }>> => {
		const userIdResult = await currentUserId();
		if (!userIdResult.success) {
			return { success: false, error: userIdResult.error };
		}

		const [publicListIdResult, emailResult] = await Promise.all([
			currentUserPublicListId(),
			currentUserEmail(),
		]);

		if (!publicListIdResult.success) {
			return { success: false, error: publicListIdResult.error };
		}
		if (!emailResult.success) {
			return { success: false, error: emailResult.error };
		}

		return {
			success: true,
			data: {
				publicListId: publicListIdResult.data.publicListId,
				email: emailResult.data.email,
			},
		};
	},
);
