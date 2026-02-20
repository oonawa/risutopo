export type MovieDetail = {
	id: number;
	poster_path: `/${string}`;
	adult: boolean;
	overview: string;
	release_date: string;
	title: string;
	backdrop_path: `/${string}`;
	runtime: number;
};

export type MovieSearchApiResponse = {
	page: number;
	results: MovieDetail[];
	total_pages: number;
	total_results: number;
};
