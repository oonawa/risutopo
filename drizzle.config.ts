import "dotenv/config";
import type { Config } from "drizzle-kit";

const tursoDatabaseUrl = process.env.TURSO_DATABASE_URL;

if (!tursoDatabaseUrl) {
	throw new Error("TURSO_DATABASE_URLがみつかりません");
}

const isLocal = tursoDatabaseUrl.startsWith("file:");

export default {
	schema: "./db/schema.ts",
	out: "./migrations",
	dialect: isLocal ? "sqlite" : "turso",
	dbCredentials: isLocal
		? { url: tursoDatabaseUrl }
		: {
				url: tursoDatabaseUrl,
				authToken: process.env.TURSO_AUTH_TOKEN,
			},
} satisfies Config;
