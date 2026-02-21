PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_movies_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`externalDatabaseMovieId` text NOT NULL,
	`title` text NOT NULL,
	`overview` text NOT NULL,
	`backgroundImage` text NOT NULL,
	`posterImage` text NOT NULL,
	`runnningMinutes` integer NOT NULL,
	`releaseDate` text NOT NULL,
	`releaseYear` integer NOT NULL,
	`cached_at` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_movies_table`("id", "externalDatabaseMovieId", "title", "overview", "backgroundImage", "posterImage", "runnningMinutes", "releaseDate", "releaseYear", "cached_at") SELECT "id", "externalDatabaseMovieId", "title", "overview", "backgroundImage", "posterImage", "runnningMinutes", printf('%04d-01-01', "releaseYear"), "releaseYear", "cached_at" FROM `movies_table`;--> statement-breakpoint
DROP TABLE `movies_table`;--> statement-breakpoint
ALTER TABLE `__new_movies_table` RENAME TO `movies_table`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `movies_table_externalDatabaseMovieId_unique` ON `movies_table` (`externalDatabaseMovieId`);
