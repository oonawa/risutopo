import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";
import crypto from "crypto";
import { db } from "@/db/client";
import { authTokensTable } from "@/db/schema";
import { and, eq, gt } from "drizzle-orm";

function getSecretKey(): Uint8Array {
	const secret = process.env.JWT_SECRET;
	if (!secret) {
		throw new Error("JWT_SECRET is not defined");
	}
	return new TextEncoder().encode(secret);
}

export async function verifySessionToken(): Promise<{
	userId: number;
	email: string;
	deviceId: string;
} | null> {
	try {
		const cookieStore = await cookies();
		const sessionToken = cookieStore.get("session_token")?.value;

		if (!sessionToken) {
			return null;
		}

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
			return {
				userId: Number(userId),
				email,
				deviceId,
			};
		}

		return null;
	} catch (error) {
		console.error("Token verification failed:", error);
		return null;
	}
}

export async function verifyTempSessionToken(): Promise<{
	email: string;
} | null> {
	try {
		const cookieStore = await cookies();
		const tempToken = cookieStore.get("temp_session_token")?.value;

		if (!tempToken) {
			return null;
		}

		const now = new Date();
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

export async function isAuthenticated(): Promise<boolean> {
	const payload = await verifySessionToken();
	return payload !== null;
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
