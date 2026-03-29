PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_session_tokens_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`token` text NOT NULL,
	`email` text NOT NULL,
	`user_id` integer NOT NULL,
	`device_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users_table`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_session_tokens_table`("token", "email", "user_id", "device_id", "expires_at", "created_at") SELECT "token", "email", "user_id", "device_id", "expires_at", "created_at" FROM `session_tokens_table`;--> statement-breakpoint
DROP TABLE `session_tokens_table`;--> statement-breakpoint
ALTER TABLE `__new_session_tokens_table` RENAME TO `session_tokens_table`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `session_tokens_table_token_unique` ON `session_tokens_table` (`token`);--> statement-breakpoint
CREATE TABLE `__new_temp_session_tokens_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`token` text NOT NULL,
	`email` text NOT NULL,
	`device_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_temp_session_tokens_table`("token", "email", "device_id", "expires_at", "created_at") SELECT "token", "email", "device_id", "expires_at", "created_at" FROM `temp_session_tokens_table`;--> statement-breakpoint
DROP TABLE `temp_session_tokens_table`;--> statement-breakpoint
ALTER TABLE `__new_temp_session_tokens_table` RENAME TO `temp_session_tokens_table`;--> statement-breakpoint
CREATE UNIQUE INDEX `temp_session_tokens_table_token_unique` ON `temp_session_tokens_table` (`token`);