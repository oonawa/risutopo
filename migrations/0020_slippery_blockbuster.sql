PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_lists_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`publicId` text NOT NULL,
	`userId` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users_table`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_lists_table`("id", "publicId", "userId") SELECT "id", "publicId", "userId" FROM `lists_table`;--> statement-breakpoint
DROP TABLE `lists_table`;--> statement-breakpoint
ALTER TABLE `__new_lists_table` RENAME TO `lists_table`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `lists_table_publicId_unique` ON `lists_table` (`publicId`);--> statement-breakpoint
CREATE UNIQUE INDEX `lists_table_userId_unique` ON `lists_table` (`userId`);