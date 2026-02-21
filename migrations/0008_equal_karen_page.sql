CREATE TABLE `directors_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`cached_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `movie_directors_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`movieId` integer NOT NULL,
	`directorId` integer NOT NULL,
	FOREIGN KEY (`movieId`) REFERENCES `movies_table`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`directorId`) REFERENCES `directors_table`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_movie_services_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer,
	`movieId` integer,
	`streamingServiceId` integer NOT NULL,
	`watchUrl` text NOT NULL,
	`titleOnService` text,
	FOREIGN KEY (`userId`) REFERENCES `users_table`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`movieId`) REFERENCES `movies_table`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`streamingServiceId`) REFERENCES `streaming_services_table`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_movie_services_table`("id", "userId", "movieId", "streamingServiceId", "watchUrl", "titleOnService") SELECT "id", null, "movieId", "streamingServiceId", "watchUrl", null FROM `movie_services_table`;--> statement-breakpoint
DROP TABLE `movie_services_table`;--> statement-breakpoint
ALTER TABLE `__new_movie_services_table` RENAME TO `movie_services_table`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `movies_table` ADD `externalDatabaseMovieId` text;--> statement-breakpoint
ALTER TABLE `movies_table` ADD `backgroundImage` text;--> statement-breakpoint
ALTER TABLE `movies_table` ADD `posterImage` text;--> statement-breakpoint
ALTER TABLE `movies_table` ADD `runnningMinutes` integer;--> statement-breakpoint
ALTER TABLE `movies_table` ADD `releaseYear` integer;--> statement-breakpoint
ALTER TABLE `movies_table` ADD `cached_at` integer;--> statement-breakpoint
CREATE UNIQUE INDEX `movies_table_externalDatabaseMovieId_unique` ON `movies_table` (`externalDatabaseMovieId`);