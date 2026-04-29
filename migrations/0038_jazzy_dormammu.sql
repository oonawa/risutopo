CREATE TABLE `sub_list_items_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`sub_list_id` integer NOT NULL,
	`list_item_id` integer NOT NULL,
	FOREIGN KEY (`sub_list_id`) REFERENCES `sub_lists_table`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`list_item_id`) REFERENCES `list_items_table`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sub_list_items_sub_list_id_list_item_id_unique` ON `sub_list_items_table` (`sub_list_id`,`list_item_id`);--> statement-breakpoint
CREATE TABLE `sub_lists_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`public_id` text NOT NULL,
	`list_id` integer NOT NULL,
	`name` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`list_id`) REFERENCES `lists_table`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sub_lists_table_public_id_unique` ON `sub_lists_table` (`public_id`);