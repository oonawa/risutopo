CREATE TABLE `delete_intent_tokens_table` (
	`token` text NOT NULL,
	`user_id` integer NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users_table`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `delete_intent_tokens_table_token_unique` ON `delete_intent_tokens_table` (`token`);