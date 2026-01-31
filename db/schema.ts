import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable("users_table", {
	id: int().primaryKey({ autoIncrement: true }),
	name: text().notNull(),
	nickname: text().notNull()
});

export const streamingServicesTable = sqliteTable("streaming_services_table", {
	id: int().primaryKey({ autoIncrement: true }),
	name: text().notNull(),
	slug: text().notNull().unique(),
});

export const moviesTable = sqliteTable("movies_table", {
	id: int().primaryKey({ autoIncrement: true }),
	title: text().notNull(),
	streamingServiceId: int()
		.notNull()
		.references(() => streamingServicesTable.id, {
			onDelete: "cascade",
			onUpdate: "cascade",
		}),
	watchUrl: text().notNull(),
});
