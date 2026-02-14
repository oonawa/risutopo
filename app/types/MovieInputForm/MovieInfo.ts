import type { SupportedServiceSlug, SupportedServiceName } from "@/app/consts";

export type MovieInfo = {
	title: string;
	url: string;
	serviceSlug: SupportedServiceSlug;
	serviceName: SupportedServiceName;
};
