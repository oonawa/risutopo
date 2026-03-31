import crypto from "node:crypto";

function getKey(): Buffer {
	const key = process.env.ENCRYPTION_KEY;
	if (!key) throw new Error("ENCRYPTION_KEY が設定されていません");
	return Buffer.from(key, "hex");
}

function getHmacSecret(): Buffer {
	const secret = process.env.HMAC_SECRET;
	if (!secret) throw new Error("HMAC_SECRET が設定されていません");
	return Buffer.from(secret, "hex");
}

// iv(12B) + authTag(16B) + 暗号文 をBase64で保存
export function encrypt(plaintext: string): string {
	const iv = crypto.randomBytes(12);
	const cipher = crypto.createCipheriv("aes-256-gcm", getKey(), iv);
	const encrypted = Buffer.concat([
		cipher.update(plaintext, "utf8"),
		cipher.final(),
	]);
	const authTag = cipher.getAuthTag();
	return Buffer.concat([iv, authTag, encrypted]).toString("base64");
}

export function decrypt(ciphertext: string): string {
	const buf = Buffer.from(ciphertext, "base64");
	const iv = buf.subarray(0, 12);
	const authTag = buf.subarray(12, 28);
	const encrypted = buf.subarray(28);
	const decipher = crypto.createDecipheriv("aes-256-gcm", getKey(), iv);
	decipher.setAuthTag(authTag);
	return decipher.update(encrypted) + decipher.final("utf8");
}

// 検索用：同じ入力から常に同じ値を生成する決定的ハッシュ
export function computeHmac(value: string): string {
	return crypto
		.createHmac("sha256", getHmacSecret())
		.update(value)
		.digest("hex");
}
