// E2E テスト専用 DB クライアント
// db/client.ts は top-level await を含むため Playwright から直接使用できない。
// このファイルは top-level await なしで DB 接続を作成する。
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "@/db/schema";

const dbUrl = process.env.TURSO_DATABASE_URL;
if (!dbUrl) {
	throw new Error("TURSO_DATABASE_URL が見つかりません");
}

const client = createClient({ url: dbUrl });
export const db = drizzle(client, { schema });
