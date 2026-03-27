"use server";

import { cache } from "react";
import type { Result } from "../types/Result";
import { currentUserId } from "./currentUserId";
import { getPublicListId } from "@/features/list/actions/getPublicListId";

export const currentUserPublicListId = cache(
	async (): Promise<Result<{ publicListId: string }>> => {
		const result = await currentUserId();

		if (!result.success) {
			return result;
		}

		return await getPublicListId(result.data.userId);
	},
);
