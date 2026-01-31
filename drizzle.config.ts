import "dotenv/config";
import type { Config } from "drizzle-kit";

const tursoDatabaseUrl = process.env.TURSO_DATABASE_URL;

if (!tursoDatabaseUrl) {
	throw new Error("TURSO_DATABASE_URLがみつかりません");
}

export default {
	schema: "./db/schema.ts",
	out: "./migrations",
	dialect: "turso",
	dbCredentials: {
		url: tursoDatabaseUrl,
		authToken: process.env.TURSO_AUTH_TOKEN,
	},
} satisfies Config;
