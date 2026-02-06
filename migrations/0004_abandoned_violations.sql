CREATE TABLE `login_attempts_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ip_address` text NOT NULL,
	`email` text,
	`attempt_type` text NOT NULL,
	`attempted_at` integer NOT NULL,
	`success` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE `auth_tokens_table` ADD `device_id` text;