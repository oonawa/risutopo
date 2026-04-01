DELETE FROM `login_codes_table`;--> statement-breakpoint
DELETE FROM `temp_session_tokens_table`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_login_codes_table` (
	`token` text NOT NULL,
	`email_hmac` text NOT NULL,
	`encrypted_email` text NOT NULL,
	`user_id` integer REFERENCES `users_table`(`id`) ON UPDATE no action ON DELETE cascade,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
DROP TABLE `login_codes_table`;--> statement-breakpoint
ALTER TABLE `__new_login_codes_table` RENAME TO `login_codes_table`;--> statement-breakpoint
CREATE TABLE `__new_temp_session_tokens_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`token` text NOT NULL,
	`email_hmac` text NOT NULL,
	`encrypted_email` text NOT NULL,
	`device_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
DROP TABLE `temp_session_tokens_table`;--> statement-breakpoint
ALTER TABLE `__new_temp_session_tokens_table` RENAME TO `temp_session_tokens_table`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `login_codes_table_token_unique` ON `login_codes_table` (`token`);--> statement-breakpoint
CREATE UNIQUE INDEX `temp_session_tokens_table_token_unique` ON `temp_session_tokens_table` (`token`);
