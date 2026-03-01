import { jwtVerify, SignJWT } from "jose";
import crypto from "node:crypto";
import { db } from "@/db/client";
import { authTokensTable } from "@/db/schema";
import { and, eq, gt } from "drizzle-orm";
import { cookies } from "next/headers";

export async function verifySessionToken({
	sessionToken,
	now,
}: {
	sessionToken?: string;
	now: Date;
}): Promise<{
	userId: number;
	email: string;
	deviceId: string;
} | null> {
	if (!sessionToken) {
		return null;
	}

	try {
		const secretKey = getSecretKey();
		const { payload } = await jwtVerify(sessionToken, secretKey, {
			algorithms: ["HS256"],
		});

		if (payload.type !== "session_token") {
			return null;
		}

		const { userId, email, deviceId, type, exp, iat } = payload;

		if (
			typeof userId === "string" &&
			typeof email === "string" &&
			typeof deviceId === "string" &&
			typeof type === "string" &&
			typeof exp === "number" &&
			typeof iat === "number"
		) {
			const parsedUserId = Number(userId);
			if (!Number.isFinite(parsedUserId)) {
				return null;
			}

			const [record] = await db
				.select({
					userId: authTokensTable.userId,
					email: authTokensTable.email,
					deviceId: authTokensTable.deviceId,
				})
				.from(authTokensTable)
				.where(
					and(
						eq(authTokensTable.token, sessionToken),
						eq(authTokensTable.tokenType, "session_token"),
						eq(authTokensTable.userId, parsedUserId),
						eq(authTokensTable.email, email),
						eq(authTokensTable.deviceId, deviceId),
						gt(authTokensTable.expiresAt, now),
					),
				);

			if (!record) {
				return null;
			}

			return {
				userId: parsedUserId,
				email: record.email,
				deviceId: record.deviceId ?? deviceId,
			};
		}

		return null;
	} catch (error) {
		console.error("Token verification failed:", error);
		return null;
	}
}

export async function verifyTempSessionToken({
	tempToken,
	now,
}: {
	tempToken?: string;
	now: Date;
}): Promise<{
	email: string;
} | null> {
	if (!tempToken) {
		return null;
	}

	try {
		const [record] = await db
			.select({
				email: authTokensTable.email,
			})
			.from(authTokensTable)
			.where(
				and(
					eq(authTokensTable.token, tempToken),
					eq(authTokensTable.tokenType, "temp_session_token"),
					gt(authTokensTable.expiresAt, now),
				),
			);

		if (!record) {
			return null;
		}

		return { email: record.email };
	} catch (error) {
		console.error("Temp token verification failed:", error);
		return null;
	}
}

export async function isAuthenticated() {
	const cookieStore = await cookies();
	const sessionToken = cookieStore.get("session_token")?.value;

	const payload = await verifySessionToken({
		sessionToken,
		now: new Date(),
	});

	return payload;
}

function getSecretKey(): Uint8Array {
	const secret = process.env.JWT_SECRET;
	if (!secret) {
		throw new Error("JWT_SECRET is not defined");
	}
	return new TextEncoder().encode(secret);
}

export async function generateSessionToken({
	userId,
	email,
	deviceId,
}: {
	userId: number;
	email: string;
	deviceId: string;
}) {
	const secretKey = getSecretKey();

	return await new SignJWT({
		userId: userId.toString(),
		email,
		deviceId,
		type: "session_token",
	})
		.setProtectedHeader({ alg: "HS256" })
		.setExpirationTime("30d")
		.setIssuedAt()
		.sign(secretKey);
}

export function generateTempSessionToken() {
	return crypto.randomBytes(32).toString("hex");
}

export function addDays(date: Date, days: number) {
	return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}
