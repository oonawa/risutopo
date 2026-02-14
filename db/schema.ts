import { int, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import type { SupportedServiceName, SupportedServiceSlug } from "@/app/consts";

export const usersTable = sqliteTable("users_table", {
	id: int().primaryKey({ autoIncrement: true }),
	publicId: text().notNull().unique(),
	email: text("email").notNull().unique(),
});

export const streamingServicesTable = sqliteTable("streaming_services_table", {
	id: int().primaryKey({ autoIncrement: true }),
	name: text().$type<SupportedServiceName>().notNull(),
	slug: text().$type<SupportedServiceSlug>().notNull().unique(),
});

export const moviesTable = sqliteTable("movies_table", {
	id: int().primaryKey({ autoIncrement: true }),
	title: text().notNull(),
});

export const movieServicesTable = sqliteTable(
	"movie_services_table",
	{
		id: int().primaryKey({ autoIncrement: true }),
		movieId: int()
			.notNull()
			.references(() => moviesTable.id),
		streamingServiceId: int()
			.notNull()
			.references(() => streamingServicesTable.id),
		watchUrl: text().notNull(),
	},
	(table) => [
		uniqueIndex("movie_services_movie_id_streaming_service_id_unique").on(
			table.movieId,
			table.streamingServiceId,
		),
	],
);

export const listsTable = sqliteTable("lists_table", {
	id: int().primaryKey({ autoIncrement: true }),
	userId: int()
		.notNull()
		.unique()
		.references(() => usersTable.id),
});

export const listMoviesTable = sqliteTable("list_movies_table", {
	id: int().primaryKey({ autoIncrement: true }),
	listId: int()
		.notNull()
		.references(() => listsTable.id),
	movieServiceId: int()
		.notNull()
		.references(() => movieServicesTable.id),
});

export const authTokensTable = sqliteTable("auth_tokens_table", {
	token: text("token").notNull().unique(),
	tokenType: text("token_type")
		.$type<"session_token" | "temp_session_token" | "login_code">()
		.notNull(),
	email: text("email").notNull(),
	userId: int("user_id").references(() => usersTable.id, {
		onDelete: "cascade",
	}),
	deviceId: text("device_id"),
	expiresAt: int("expires_at", { mode: "timestamp" }).notNull(),
	createdAt: int("created_at", { mode: "timestamp" }).notNull(),
});

export const loginAttemptsTable = sqliteTable("login_attempts_table", {
	id: int().primaryKey({ autoIncrement: true }),
	ipAddress: text("ip_address").notNull(),
	email: text("email"),
	attemptType: text("attempt_type")
		.$type<"code_verify" | "code_send">()
		.notNull(),
	attemptedAt: int("attempted_at", { mode: "timestamp" }).notNull(),
	success: int("success", { mode: "boolean" }).notNull().default(false),
});
