export type Result<T = void, E = { message: string }> =
	| (T extends void ? { success: true } : { success: true; data: T })
	| {
			success: false;
			error: E;
	  };
