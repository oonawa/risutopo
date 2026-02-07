import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable("users_table", {
	id: int().primaryKey({ autoIncrement: true }),
	publicId: text().notNull().unique(),
	email: text("email").notNull().unique(),
});

export const streamingServicesTable = sqliteTable("streaming_services_table", {
	id: int().primaryKey({ autoIncrement: true }),
	name: text().notNull(),
	slug: text().notNull().unique(),
});

export const moviesTable = sqliteTable("movies_table", {
	id: int().primaryKey({ autoIncrement: true }),
	title: text().notNull().unique(),
});

export const movieServicesTable = sqliteTable("movie_services_table", {
	id: int().primaryKey({ autoIncrement: true }),
	movieId: int()
		.notNull()
		.references(() => moviesTable.id),
	streamingServiceId: int()
		.notNull()
		.references(() => streamingServicesTable.id),
	watchUrl: text().notNull(),
});

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
	tokenType: text("token_type").notNull(),
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
	attemptType: text("attempt_type").notNull(), // 'code_verify' | 'code_send'
	attemptedAt: int("attempted_at", { mode: "timestamp" }).notNull(),
	success: int("success", { mode: "boolean" }).notNull().default(false),
});
