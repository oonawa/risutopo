import crypto from "crypto";

export function generateDeviceId(userAgent: string) {
	return crypto
		.createHash("sha256")
		.update(userAgent)
		.digest("hex")
		.substring(0, 16);
}
