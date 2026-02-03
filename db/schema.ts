import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable("users_table", {
	id: int().primaryKey({ autoIncrement: true }),
	name: text().notNull(),
	nickname: text().notNull(),
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
