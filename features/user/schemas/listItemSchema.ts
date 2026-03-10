import { z } from "zod";
import { SUPPORTED_SERVICES } from "@/app/consts";

const supportedServiceSlugSchema = z.enum([
	SUPPORTED_SERVICES.U_NEXT.slug,
	SUPPORTED_SERVICES.NETFLIX.slug,
	SUPPORTED_SERVICES.HULU.slug,
	SUPPORTED_SERVICES.PRIME_VIDEO.slug,
	SUPPORTED_SERVICES.DISNEY_PLUS.slug,
]);

const supportedServiceNameSchema = z.enum([
	SUPPORTED_SERVICES.U_NEXT.name,
	SUPPORTED_SERVICES.NETFLIX.name,
	SUPPORTED_SERVICES.HULU.name,
	SUPPORTED_SERVICES.PRIME_VIDEO.name,
	SUPPORTED_SERVICES.DISNEY_PLUS.name,
]);

const localListItemDetailsSchema = z.object({
	movieId: z.number().int().positive(),
	officialTitle: z.string().min(1),
	backgroundImage: z.url(),
	posterImage: z.url(),
	director: z.array(z.string().min(1)),
	runningMinutes: z.number().int().positive(),
	releaseYear: z.number().int(),
	externalDatabaseMovieId: z.number().int().nonnegative(),
	overview: z.string().min(1),
});

export const registerLocalListItemSchema = z.object({
	listItemId: z.string().min(1),
	title: z.string().min(1),
	url: z.url(),
	serviceSlug: supportedServiceSlugSchema,
	serviceName: supportedServiceNameSchema,
	isWatched: z.boolean().optional(),
	createdAt: z.coerce.date(),
	details: localListItemDetailsSchema.optional(),
});

export const registerLocalListPayloadSchema = z.object({
	listId: z.string(),
	items: z.array(z.unknown()),
});

export type RegisterLocalListInput = z.infer<
	typeof registerLocalListPayloadSchema
>;
