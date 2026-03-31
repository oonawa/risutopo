ALTER TABLE `users_table` ADD `public_id_hmac` text;--> statement-breakpoint
CREATE UNIQUE INDEX `users_table_public_id_hmac_unique` ON `users_table` (`public_id_hmac`);--> statement-breakpoint
ALTER TABLE `user_emails_table` ADD `email_hmac` text;--> statement-breakpoint
CREATE UNIQUE INDEX `user_emails_table_email_hmac_unique` ON `user_emails_table` (`email_hmac`);--> statement-breakpoint
ALTER TABLE `login_codes_table` RENAME COLUMN `email` TO `email_hmac`;--> statement-breakpoint
ALTER TABLE `login_codes_table` ADD `encrypted_email` text NOT NULL DEFAULT '';--> statement-breakpoint
ALTER TABLE `temp_session_tokens_table` RENAME COLUMN `email` TO `email_hmac`;--> statement-breakpoint
ALTER TABLE `login_attempts_table` RENAME COLUMN `email` TO `email_hmac`;--> statement-breakpoint
ALTER TABLE `deleted_users_table` RENAME COLUMN `public_id` TO `public_id_hmac`;
