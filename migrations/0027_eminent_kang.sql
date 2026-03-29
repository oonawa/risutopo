CREATE TABLE `deleted_users_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`public_id` text NOT NULL,
	`deleted_at` integer NOT NULL
);
