"use server";

import { cookies } from "next/headers";
import type { Result } from "@/features/shared/types/Result";
import { logoutService } from "../services/logoutService";

export async function logout(): Promise<Result> {
	const cookieStore = await cookies();
	const sessionToken = cookieStore.get("session_token")?.value;

	if (sessionToken) {
		await logoutService({ sessionToken });
	}

	cookieStore.delete("session_token");

	return {
		success: true,
	};
}
