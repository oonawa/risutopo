PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_auth_tokens_table` (
	`token` text NOT NULL,
	`token_type` text NOT NULL,
	`email` text NOT NULL,
	`user_id` integer,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users_table`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_auth_tokens_table`("token", "token_type", "email", "user_id", "expires_at", "created_at") SELECT "token", "token_type", "email", "user_id", "expires_at", "created_at" FROM `auth_tokens_table`;--> statement-breakpoint
DROP TABLE `auth_tokens_table`;--> statement-breakpoint
ALTER TABLE `__new_auth_tokens_table` RENAME TO `auth_tokens_table`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `auth_tokens_table_token_unique` ON `auth_tokens_table` (`token`);--> statement-breakpoint
ALTER TABLE `users_table` DROP COLUMN `name`;