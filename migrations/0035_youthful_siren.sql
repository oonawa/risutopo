DELETE FROM `login_attempts_table`;--> statement-breakpoint
DELETE FROM `temp_session_tokens_table`;--> statement-breakpoint
ALTER TABLE `login_attempts_table` ADD `ip_address_hmac` text NOT NULL;--> statement-breakpoint
ALTER TABLE `login_attempts_table` DROP COLUMN `ip_address`;--> statement-breakpoint
ALTER TABLE `temp_session_tokens_table` ADD `encrypted_email` text NOT NULL;