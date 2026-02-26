import type { MovieInfo } from "./MovieInfo";

export type DuplicateType =
	| "sameExternalDatabaseMovieId"
	| "sameWatchUrl"
	| "sameTitleDifferentUrl";

export type DuplicateListItem = MovieInfo & {
	duplicateType: DuplicateType;
};
