export type AppError =
	| { code: "UNAUTHORIZED_ERROR"; message: string }
	| { code: "FORBIDDEN_ERROR"; message: string }
	| { code: "NOT_FOUND_ERROR"; message: string }
	| { code: "VALIDATION_ERROR"; message: string }
	| { code: "INTERNAL_ERROR"; message: string }
	| { code: "TOO_MANY_REQUESTS_ERROR"; message: string };

export type Result<T = undefined> =
	| ([T] extends [undefined] ? { success: true } : { success: true; data: T })
	| {
			success: false;
			error: AppError;
	  };
