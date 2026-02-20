import type { SupportedServiceSlug, SupportedServiceName } from "@/app/consts";

export type MovieInfo = {
	title: string;
	url: string;
	serviceSlug: SupportedServiceSlug;
	serviceName: SupportedServiceName;
	details?: {
		officialTitle: string;
		backgroundImage: string;
		posterImage: string;
		director: string[];
		runnningMinutes: number;
		releaseYear: number;
	};
};
