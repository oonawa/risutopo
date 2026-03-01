CREATE TABLE `list_items_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`listId` integer NOT NULL,
	`streamingServiceId` integer NOT NULL,
	`movieId` integer,
	`watchUrl` text NOT NULL,
	`titleOnService` text NOT NULL,
	FOREIGN KEY (`listId`) REFERENCES `lists_table`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`streamingServiceId`) REFERENCES `streaming_services_table`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`movieId`) REFERENCES `movies_table`(`id`) ON UPDATE no action ON DELETE no action
);
