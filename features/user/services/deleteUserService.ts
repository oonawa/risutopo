import { db } from "@/db/client";
import type { Result } from "@/features/shared/types/Result";
import {
	deleteUserById,
	findUserById,
	insertDeletedUser,
} from "../repositories/userRepository";

export async function deleteUserService({
	userId,
	now,
}: {
	userId: number;
	now: Date;
}): Promise<Result> {
	try {
		await db.transaction(async (tx) => {
			const user = await findUserById(tx, userId);
			if (!user) return;

			await insertDeletedUser({
				tx,
				publicId: user.publicId,
				deletedAt: now,
			});

			await deleteUserById({
				tx,
				userId,
			});
		});
	} catch (error) {
		console.error(error);
		return {
			success: false,
			error: {
				code: "INTERNAL_ERROR",
				message: "ユーザー削除の処理に失敗しました。",
			},
		};
	}

	return {
		success: true,
	};
}
