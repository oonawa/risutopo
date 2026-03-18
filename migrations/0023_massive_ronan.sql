DELETE FROM `movie_directors_table`
WHERE `id` NOT IN (
	SELECT MIN(`id`)
	FROM `movie_directors_table`
	GROUP BY `movieId`, `directorId`
);
--> statement-breakpoint
CREATE UNIQUE INDEX `movie_directors_movie_id_director_id_unique` ON `movie_directors_table` (`movieId`,`directorId`);
