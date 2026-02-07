import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

const tursoDatabaseUrl = process.env.TURSO_DATABASE_URL;

if (!tursoDatabaseUrl) {
	throw new Error("TURSO_DATABASE_URLがみつかりません");
}

const createProductionClient = () => {
	return createClient({
		url: tursoDatabaseUrl,
		authToken: process.env.TURSO_AUTH_TOKEN,
	});
};

const client =
	process.env.NODE_ENV === "production"
		? createProductionClient()
		: createClient({
				url: tursoDatabaseUrl,
			});

export const db = drizzle(client);

export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
export type Executor = Pick<Tx, "select" | "insert" | "update" | "delete" | "query">;
