import { int, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import type { SupportedServiceName, SupportedServiceSlug } from "@/app/consts";

export const usersTable = sqliteTable("users_table", {
	id: int().primaryKey({ autoIncrement: true }),
	publicId: text().notNull().unique(),
});

export const userEmailsTable = sqliteTable("user_emails_table", {
	id: int().primaryKey({ autoIncrement: true }),
	userId: int("user_id")
		.notNull()
		.references(() => usersTable.id, {
			onDelete: "cascade",
		}),
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
});

export const movieCacheTable = sqliteTable("movie_cache_table", {
	movieId: int()
		.notNull()
		.primaryKey()
		.references(() => moviesTable.id),
	cachedAt: int("cached_at", { mode: "timestamp" }).notNull(),
});

export const directorsTable = sqliteTable("directors_table", {
	id: int().primaryKey({ autoIncrement: true }),
	name: text().notNull(),
});

export const directorCacheTable = sqliteTable("director_cache_table", {
	movieId: int()
		.notNull()
		.primaryKey()
		.references(() => moviesTable.id),
	cachedAt: int("cached_at", { mode: "timestamp" }).notNull(),
});

export const movieDirectorsTable = sqliteTable(
	"movie_directors_table",
	{
		id: int().primaryKey({ autoIncrement: true }),
		movieId: int()
			.notNull()
			.references(() => moviesTable.id),
		directorId: int()
			.notNull()
			.references(() => directorsTable.id),
	},
	(table) => [
		uniqueIndex("movie_directors_movie_id_director_id_unique").on(
			table.movieId,
			table.directorId,
		),
	],
);

export const listsTable = sqliteTable("lists_table", {
	id: int().primaryKey({ autoIncrement: true }),
	publicId: text().notNull().unique(),
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
		watchUrl: text().notNull(),
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

export const listItemMovieMatchTable = sqliteTable(
	"list_item_movie_match_table",
	{
		listItemId: int("list_item_id")
			.notNull()
			.primaryKey()
			.references(() => listItemsTable.id, {
				onDelete: "cascade",
			}),
		movieId: int("movie_id")
			.notNull()
			.references(() => moviesTable.id),
	},
);

export const watchedItemsTable = sqliteTable("watched_items_table", {
	listItemId: int("list_item_id")
		.notNull()
		.primaryKey()
		.references(() => listItemsTable.id, {
			onDelete: "cascade",
		}),
	watchedAt: int("watched_at", { mode: "timestamp" }).notNull(),
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
