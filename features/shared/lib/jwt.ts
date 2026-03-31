import { SignJWT } from "jose";
import crypto from "node:crypto";

export function getSecretKey(): Uint8Array {
	const secret = process.env.JWT_SECRET;
	if (!secret) {
		throw new Error("JWT_SECRET is not defined");
	}
	return new TextEncoder().encode(secret);
}

export async function generateSessionToken({
	userId,
	deviceId,
}: {
	userId: number;
	deviceId: string;
}) {
	return await new SignJWT({
		userId: userId.toString(),
		deviceId,
		type: "session_token",
	})
		.setProtectedHeader({ alg: "HS256" })
		.setExpirationTime("30d")
		.setIssuedAt()
		.sign(getSecretKey());
}

export function generateTempSessionToken() {
	return crypto.randomBytes(32).toString("hex");
}
