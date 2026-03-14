import { SignJWT } from "jose";
import crypto from "node:crypto";
import { db } from "@/db/client";
import { authTokensTable } from "@/db/schema";
import { and, eq, gt } from "drizzle-orm";

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
