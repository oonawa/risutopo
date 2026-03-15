"use server";

import { cache } from "react";
import type { Result } from "../types/Result";
import { currentUserId } from "./currentUserId";
import { getUserMovieListPublicId } from "@/features/list/actions/getUserMovieListPublicId";

export const currentUserPublicListId = cache(
	async (): Promise<Result<{ publicListId: string }>> => {
		const result = await currentUserId();

		if (!result.success) {
			return result;
		}

		return await getUserMovieListPublicId(result.data.userId);
	},
);
