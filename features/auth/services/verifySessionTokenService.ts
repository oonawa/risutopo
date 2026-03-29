import type { Result } from "@/features/shared/types/Result";
import { jwtVerify } from "jose";
import { db } from "@/db/client";
import { sessionTokensTable } from "@/db/schema";
import { and, eq, gt } from "drizzle-orm";
import { getSecretKey } from "@/lib/jwt";

export async function verifySessionTokenService({
	sessionToken,
	now,
}: {
	sessionToken: string;
	now: Date;
}): Promise<Result<{ userId: number }>> {
	const secretKey = getSecretKey();

	try {
		const { payload } = await jwtVerify(sessionToken, secretKey, {
			algorithms: ["HS256"],
		});

		if (payload.type !== "session_token") {
			return {
				success: false,
				error: {
					code: "UNAUTHORIZED_ERROR",
					message: "",
				},
			};
		}

		const { userId, deviceId } = payload;

		const isString = (propName: unknown): propName is string => {
			return typeof propName === "string";
		};

		if (!isString(userId) || !isString(deviceId)) {
			console.error("セッションの検証中に内部エラーが発生しました。");
			console.error(JSON.stringify(payload));

			return {
				success: false,
				error: {
					code: "INTERNAL_ERROR",
					message: "",
				},
			};
		}

		const parsedUserId = Number(userId);

		if (Number.isFinite(parsedUserId) === false) {
			console.error("セッションの検証中に内部エラーが発生しました。");
			console.error(`userId: ${userId}`);
			console.error(`parsedUserId: ${parsedUserId}`);

			return {
				success: false,
				error: {
					code: "INTERNAL_ERROR",
					message: "",
				},
			};
		}

		const [record] = await db
			.select({
				userId: sessionTokensTable.userId,
				deviceId: sessionTokensTable.deviceId,
			})
			.from(sessionTokensTable)
			.where(
				and(
					eq(sessionTokensTable.token, sessionToken),
					eq(sessionTokensTable.userId, parsedUserId),
					eq(sessionTokensTable.deviceId, deviceId),
					gt(sessionTokensTable.expiresAt, now),
				),
			);

		if (!record) {
			return {
				success: false,
				error: {
					code: "UNAUTHORIZED_ERROR",
					message: "",
				},
			};
		}

		return {
			success: true,
			data: {
				userId: parsedUserId,
			},
		};
	} catch (error) {
		console.error("Token verification failed:", error);
		return {
			success: false,
			error: {
				code: "INTERNAL_ERROR",
				message: "不明なエラーが発生しました。",
			},
		};
	}
}
