import type { InferSelectModel } from "drizzle-orm";
import type { moviesTable, movieServicesTable } from "@/db/schema";

export type Movie = InferSelectModel<typeof moviesTable>;
export type MovieService = InferSelectModel<typeof movieServicesTable>;
