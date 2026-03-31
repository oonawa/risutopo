DROP INDEX IF EXISTS `users_table_public_id_hmac_unique`;
--> statement-breakpoint
ALTER TABLE `users_table` DROP COLUMN `public_id_hmac`;
--> statement-breakpoint
ALTER TABLE `deleted_users_table` RENAME COLUMN `public_id_hmac` TO `public_id`;
--> statement-breakpoint
ALTER TABLE `login_attempts_table` RENAME COLUMN `ip_address` TO `ip_address_hmac`;
--> statement-breakpoint
ALTER TABLE `login_attempts_table` DROP COLUMN `email_hmac`;
