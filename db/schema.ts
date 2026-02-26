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
	externalDatabaseMovieId: text().notNull().unique(),
	title: text().notNull(),
	overview: text().notNull(),
	backgroundImage: text().notNull(),
	posterImage: text().notNull(),
	runningMinutes: int().notNull(),
	releaseDate: text().notNull(),
	releaseYear: int().notNull(),
	cachedAt: int("cached_at", { mode: "timestamp" }).notNull(),
});

export const directorsTable = sqliteTable("directors_table", {
	id: int().primaryKey({ autoIncrement: true }),
	name: text().notNull(),
	cachedAt: int("cached_at", { mode: "timestamp" }).notNull(),
});

export const movieDirectorsTable = sqliteTable("movie_directors_table", {
	id: int().primaryKey({ autoIncrement: true }),
	movieId: int()
		.notNull()
		.references(() => moviesTable.id),
	directorId: int()
		.notNull()
		.references(() => directorsTable.id),
});

export const movieServicesTable = sqliteTable("movie_services_table", {
	id: int().primaryKey({ autoIncrement: true }),
	userId: int()
		.notNull()
		.references(() => usersTable.id),
	movieId: int().references(() => moviesTable.id),
	streamingServiceId: int()
		.notNull()
		.references(() => streamingServicesTable.id),
	watchUrl: text().notNull(),
	titleOnService: text().notNull(),
});

export const listsTable = sqliteTable("lists_table", {
	id: int().primaryKey({ autoIncrement: true }),
	userId: int()
		.notNull()
		.unique()
		.references(() => usersTable.id),
});

export const listItemsTable = sqliteTable(
	"list_items_table",
	{
		id: int().primaryKey({ autoIncrement: true }),
		publicId: text().notNull().unique(),
		listId: int()
			.notNull()
			.references(() => listsTable.id),
		streamingServiceId: int()
			.notNull()
			.references(() => streamingServicesTable.id),
		movieId: int().references(() => moviesTable.id),
		watchUrl: text().notNull(),
		watchStatus: int().notNull().$type<0 | 1>().default(0),
		titleOnService: text().notNull(),
		createdAt: int("created_at", { mode: "timestamp" }).notNull(),
	},
	(table) => [
		uniqueIndex("list_items_table_listId_watchUrl_unique").on(
			table.listId,
			table.watchUrl,
		),
	],
);

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
