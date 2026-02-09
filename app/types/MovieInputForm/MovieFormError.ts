import type { ZodError } from "zod";

export type MovieFormError = { message: string } | ZodError;
