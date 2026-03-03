export type TmdbMovieResponse = {
	id: number;
	poster_path: string;
	overview: string;
	release_date: string;
	title: string;
	backdrop_path: string;
	runtime: number;
};

export type TmdbSearchResponse = {
	page: number;
	results: TmdbMovieResponse[];
	total_pages: number;
	total_results: number;
};
