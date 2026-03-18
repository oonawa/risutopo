CREATE TABLE `login_codes_table` (
	`token` text NOT NULL,
	`email` text NOT NULL,
	`user_id` integer,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users_table`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `login_codes_table_token_unique` ON `login_codes_table` (`token`);--> statement-breakpoint
INSERT INTO `login_codes_table` (`token`, `email`, `user_id`, `expires_at`, `created_at`)
SELECT `token`, `email`, `user_id`, `expires_at`, `created_at`
FROM `auth_tokens_table`
WHERE `token_type` = 'login_code';--> statement-breakpoint
CREATE TABLE `session_tokens_table` (
	`token` text NOT NULL,
	`email` text NOT NULL,
	`user_id` integer NOT NULL,
	`device_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users_table`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_tokens_table_token_unique` ON `session_tokens_table` (`token`);--> statement-breakpoint
INSERT INTO `session_tokens_table` (`token`, `email`, `user_id`, `device_id`, `expires_at`, `created_at`)
SELECT `token`, `email`, `user_id`, `device_id`, `expires_at`, `created_at`
FROM `auth_tokens_table`
WHERE `token_type` = 'session_token'
	AND `user_id` IS NOT NULL
	AND `device_id` IS NOT NULL;--> statement-breakpoint
CREATE TABLE `temp_session_tokens_table` (
	`token` text NOT NULL,
	`email` text NOT NULL,
	`device_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `temp_session_tokens_table_token_unique` ON `temp_session_tokens_table` (`token`);--> statement-breakpoint
INSERT INTO `temp_session_tokens_table` (`token`, `email`, `device_id`, `expires_at`, `created_at`)
SELECT `token`, `email`, `device_id`, `expires_at`, `created_at`
FROM `auth_tokens_table`
WHERE `token_type` = 'temp_session_token'
	AND `device_id` IS NOT NULL;--> statement-breakpoint
DROP TABLE `auth_tokens_table`;
