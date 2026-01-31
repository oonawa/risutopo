CREATE TABLE `movies_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`streamingServiceId` integer NOT NULL,
	`watchUrl` text NOT NULL,
	FOREIGN KEY (`streamingServiceId`) REFERENCES `streaming_services_table`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
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
