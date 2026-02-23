PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_movie_services_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer NOT NULL,
	`movieId` integer,
	`streamingServiceId` integer NOT NULL,
	`watchUrl` text NOT NULL,
	`titleOnService` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users_table`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`movieId`) REFERENCES `movies_table`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`streamingServiceId`) REFERENCES `streaming_services_table`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_movie_services_table`("id", "userId", "movieId", "streamingServiceId", "watchUrl", "titleOnService") SELECT "id", "userId", "movieId", "streamingServiceId", "watchUrl", "titleOnService" FROM `movie_services_table`;--> statement-breakpoint
DROP TABLE `movie_services_table`;--> statement-breakpoint
ALTER TABLE `__new_movie_services_table` RENAME TO `movie_services_table`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_movies_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`externalDatabaseMovieId` text NOT NULL,
	`title` text NOT NULL,
	`backgroundImage` text NOT NULL,
	`posterImage` text NOT NULL,
	`runnningMinutes` integer NOT NULL,
	`releaseYear` integer NOT NULL,
	`cached_at` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_movies_table`("id", "externalDatabaseMovieId", "title", "backgroundImage", "posterImage", "runnningMinutes", "releaseYear", "cached_at") SELECT "id", "externalDatabaseMovieId", "title", "backgroundImage", "posterImage", "runnningMinutes", "releaseYear", "cached_at" FROM `movies_table`;--> statement-breakpoint
DROP TABLE `movies_table`;--> statement-breakpoint
ALTER TABLE `__new_movies_table` RENAME TO `movies_table`;--> statement-breakpoint
CREATE UNIQUE INDEX `movies_table_externalDatabaseMovieId_unique` ON `movies_table` (`externalDatabaseMovieId`);