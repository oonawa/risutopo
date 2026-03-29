PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_delete_intent_tokens_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`token` text NOT NULL,
	`user_id` integer NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users_table`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_delete_intent_tokens_table`("token", "user_id", "expires_at", "created_at") SELECT "token", "user_id", "expires_at", "created_at" FROM `delete_intent_tokens_table`;--> statement-breakpoint
DROP TABLE `delete_intent_tokens_table`;--> statement-breakpoint
ALTER TABLE `__new_delete_intent_tokens_table` RENAME TO `delete_intent_tokens_table`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `delete_intent_tokens_table_token_unique` ON `delete_intent_tokens_table` (`token`);