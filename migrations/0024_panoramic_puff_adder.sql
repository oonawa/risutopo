CREATE TABLE `list_item_movie_match_table` (
	`list_item_id` integer PRIMARY KEY NOT NULL,
	`movie_id` integer NOT NULL,
	FOREIGN KEY (`list_item_id`) REFERENCES `list_items_table`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`movie_id`) REFERENCES `movies_table`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `watched_items_table` (
	`list_item_id` integer PRIMARY KEY NOT NULL,
	`watched_at` integer NOT NULL,
	FOREIGN KEY (`list_item_id`) REFERENCES `list_items_table`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_list_items_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`publicId` text NOT NULL,
	`listId` integer NOT NULL,
	`streamingServiceId` integer NOT NULL,
	`watchUrl` text NOT NULL,
	`titleOnService` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`listId`) REFERENCES `lists_table`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`streamingServiceId`) REFERENCES `streaming_services_table`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `list_item_movie_match_table`("list_item_id", "movie_id")
SELECT `id`, `movieId`
FROM `list_items_table`
WHERE `movieId` IS NOT NULL;--> statement-breakpoint
INSERT INTO `watched_items_table`("list_item_id", "watched_at")
SELECT `id`, `created_at`
FROM `list_items_table`
WHERE `watchStatus` = 1;--> statement-breakpoint
INSERT INTO `__new_list_items_table`("id", "publicId", "listId", "streamingServiceId", "watchUrl", "titleOnService", "created_at") SELECT "id", "publicId", "listId", "streamingServiceId", "watchUrl", "titleOnService", "created_at" FROM `list_items_table`;--> statement-breakpoint
DROP TABLE `list_items_table`;--> statement-breakpoint
ALTER TABLE `__new_list_items_table` RENAME TO `list_items_table`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `list_items_table_publicId_unique` ON `list_items_table` (`publicId`);--> statement-breakpoint
CREATE UNIQUE INDEX `list_items_table_listId_watchUrl_unique` ON `list_items_table` (`listId`,`watchUrl`);
