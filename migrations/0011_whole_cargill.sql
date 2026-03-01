ALTER TABLE `list_items_table` ADD `publicId` text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `list_items_table_publicId_unique` ON `list_items_table` (`publicId`);