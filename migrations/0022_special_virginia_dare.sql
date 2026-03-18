CREATE TABLE `director_cache_table` (
	`movieId` integer PRIMARY KEY NOT NULL,
	`cached_at` integer NOT NULL,
	FOREIGN KEY (`movieId`) REFERENCES `movies_table`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `movie_cache_table` (
	`movieId` integer PRIMARY KEY NOT NULL,
	`cached_at` integer NOT NULL,
	FOREIGN KEY (`movieId`) REFERENCES `movies_table`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `movie_cache_table` ("movieId", "cached_at")
SELECT `id`, `cached_at`
FROM `movies_table`;--> statement-breakpoint
INSERT INTO `director_cache_table` ("movieId", "cached_at")
SELECT
	`movie_directors_table`.`movieId`,
	MIN(`directors_table`.`cached_at`)
FROM `movie_directors_table`
INNER JOIN `directors_table`
	ON `movie_directors_table`.`directorId` = `directors_table`.`id`
GROUP BY `movie_directors_table`.`movieId`;--> statement-breakpoint
ALTER TABLE `directors_table` DROP COLUMN `cached_at`;--> statement-breakpoint
ALTER TABLE `movies_table` DROP COLUMN `releaseYear`;--> statement-breakpoint
ALTER TABLE `movies_table` DROP COLUMN `cached_at`;
