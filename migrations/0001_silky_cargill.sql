ALTER TABLE `users_table` RENAME COLUMN "nickname" TO "publicId";--> statement-breakpoint
CREATE TABLE `auth_tokens_table` (
	`token` text NOT NULL,
	`token_type` text NOT NULL,
	`email` text NOT NULL,
	`user_id` text,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users_table`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `auth_tokens_table_token_unique` ON `auth_tokens_table` (`token`);