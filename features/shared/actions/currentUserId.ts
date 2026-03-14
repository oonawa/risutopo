"use server";

import type { Result } from "../types/Result";
import { cache } from "react";
import { cookies } from "next/headers";
import { verifySessionTokenService } from "@/features/auth/services/verifySessionTokenService";

export const currentUserId = cache(
	async (): Promise<Result<{ userId: number }>> => {
		const cookieStore = await cookies();
		const sessionToken = cookieStore.get("session_token")?.value;

		if (!sessionToken) {
			return {
				success: false,
				error: {
					code: "UNAUTHORIZED_ERROR",
					message: "ログインしていません。"
				}
			};
		}

		return await verifySessionTokenService({
			sessionToken,
			now: new Date(),
		});
	},
);
