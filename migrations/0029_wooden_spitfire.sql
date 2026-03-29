PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_list_items_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`publicId` text NOT NULL,
	`listId` integer NOT NULL,
	`streamingServiceId` integer NOT NULL,
	`watchUrl` text NOT NULL,
	`titleOnService` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`listId`) REFERENCES `lists_table`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`streamingServiceId`) REFERENCES `streaming_services_table`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_list_items_table`("id", "publicId", "listId", "streamingServiceId", "watchUrl", "titleOnService", "created_at") SELECT "id", "publicId", "listId", "streamingServiceId", "watchUrl", "titleOnService", "created_at" FROM `list_items_table`;--> statement-breakpoint
DROP TABLE `list_items_table`;--> statement-breakpoint
ALTER TABLE `__new_list_items_table` RENAME TO `list_items_table`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `list_items_table_publicId_unique` ON `list_items_table` (`publicId`);--> statement-breakpoint
CREATE UNIQUE INDEX `list_items_table_listId_watchUrl_unique` ON `list_items_table` (`listId`,`watchUrl`);--> statement-breakpoint
CREATE TABLE `__new_lists_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`publicId` text NOT NULL,
	`userId` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users_table`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_lists_table`("id", "publicId", "userId") SELECT "id", "publicId", "userId" FROM `lists_table`;--> statement-breakpoint
DROP TABLE `lists_table`;--> statement-breakpoint
ALTER TABLE `__new_lists_table` RENAME TO `lists_table`;--> statement-breakpoint
CREATE UNIQUE INDEX `lists_table_publicId_unique` ON `lists_table` (`publicId`);--> statement-breakpoint
CREATE UNIQUE INDEX `lists_table_userId_unique` ON `lists_table` (`userId`);