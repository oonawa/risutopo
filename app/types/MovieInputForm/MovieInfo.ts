import type { SupportedServiceSlug, SupportedServiceName } from "@/app/consts";

export type MovieInfo = {
	listItemId?: string;
	title: string;
	url: string;
	serviceSlug: SupportedServiceSlug;
	serviceName: SupportedServiceName;
	isWatched?: boolean;
	details?: {
		movieId: number;
		officialTitle: string;
		backgroundImage: string;
		posterImage: string;
		director: string[];
		runnningMinutes: number;
		releaseYear: number;
		externalDatabaseMovieId: number;
		overview: string;
	};
};
