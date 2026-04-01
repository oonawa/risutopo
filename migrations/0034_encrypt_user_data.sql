DELETE FROM `login_attempts_table`;--> statement-breakpoint
DELETE FROM `temp_session_tokens_table`;--> statement-breakpoint
DELETE FROM `login_codes_table`;--> statement-breakpoint
DELETE FROM `users_table`;--> statement-breakpoint
ALTER TABLE `user_emails_table` ADD `email_hmac` text;--> statement-breakpoint
CREATE UNIQUE INDEX `user_emails_table_email_hmac_unique` ON `user_emails_table` (`email_hmac`);--> statement-breakpoint
ALTER TABLE `login_codes_table` RENAME COLUMN `email` TO `email_hmac`;--> statement-breakpoint
ALTER TABLE `login_codes_table` ADD `encrypted_email` text NOT NULL DEFAULT '';--> statement-breakpoint
ALTER TABLE `temp_session_tokens_table` RENAME COLUMN `email` TO `email_hmac`;--> statement-breakpoint
ALTER TABLE `login_attempts_table` RENAME COLUMN `email` TO `email_hmac`;--> statement-breakpoint
