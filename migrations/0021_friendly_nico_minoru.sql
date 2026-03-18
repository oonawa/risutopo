CREATE TABLE `user_emails_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`email` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users_table`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `user_emails_table` (`user_id`, `email`)
SELECT `id`, `email`
FROM `users_table`;--> statement-breakpoint
CREATE UNIQUE INDEX `user_emails_table_email_unique` ON `user_emails_table` (`email`);--> statement-breakpoint
DROP INDEX `users_table_email_unique`;--> statement-breakpoint
ALTER TABLE `users_table` DROP COLUMN `email`;
