DELETE FROM `user_emails_table`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_user_emails_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`encrypted_email` text NOT NULL,
	`email_hmac` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users_table`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
DROP TABLE `user_emails_table`;--> statement-breakpoint
ALTER TABLE `__new_user_emails_table` RENAME TO `user_emails_table`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `user_emails_table_email_hmac_unique` ON `user_emails_table` (`email_hmac`);