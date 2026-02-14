CREATE TABLE `list_movies_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`listId` integer NOT NULL,
	`movieServiceId` integer NOT NULL,
	FOREIGN KEY (`listId`) REFERENCES `lists_table`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`movieServiceId`) REFERENCES `movie_services_table`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `lists_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users_table`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `lists_table_userId_unique` ON `lists_table` (`userId`);--> statement-breakpoint
CREATE TABLE `movie_services_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`movieId` integer NOT NULL,
	`streamingServiceId` integer NOT NULL,
	`watchUrl` text NOT NULL,
	FOREIGN KEY (`movieId`) REFERENCES `movies_table`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`streamingServiceId`) REFERENCES `streaming_services_table`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `movies_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `movies_table_title_unique` ON `movies_table` (`title`);--> statement-breakpoint
CREATE TABLE `streaming_services_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `streaming_services_table_slug_unique` ON `streaming_services_table` (`slug`);--> statement-breakpoint
CREATE TABLE `users_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`nickname` text NOT NULL
);
