"use client";

import { useCallback, useEffect, useRef } from "react";
import type { FieldPath, FieldValues } from "react-hook-form";
import { useForm, useWatch } from "react-hook-form";
import { addMovie } from "@/app/actions/addMovie";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";

type MoviePayload =
	| {
			mobile: { shareLink: string };
	  }
	| {
			browser: { title: string; url: string };
	  };

type Options<TFieldValues extends FieldValues> = {
	schema: ValidationSchema;
	watchFields: FieldPath<TFieldValues>[];
	listId: number | null;
	buildPayload: (values: TFieldValues) => MoviePayload;
	debounceMs?: number;
};

type ValidationIssue = { path: unknown[]; message: string };
type ValidationResult =
	| { success: true }
	| { success: false; error: { issues: ValidationIssue[] } };

type ValidationSchema = {
	safeParse: (values: unknown) => ValidationResult;
};

export function useMovieInputForm<TFieldValues extends FieldValues>({
	schema,
	watchFields,
	listId,
	buildPayload,
	debounceMs = 400,
}: Options<TFieldValues>) {
	const { storageErrorMessage, appendMovieToStorage } = useLocalStorage();

	const {
		register,
		formState: { errors },
		control,
		getValues,
		getFieldState,
		setError,
		clearErrors,
	} = useForm<TFieldValues>({
		mode: "onChange",
	});

	const watched = useWatch<TFieldValues>({ control, name: watchFields });
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const applyValidationResult = useCallback(
		(issues: ValidationIssue[]) => {
			const issuesByField = new Map<string, string>();
			for (const issue of issues) {
				const field = issue.path[0];
				if (typeof field !== "string") continue;
				issuesByField.set(field, issue.message);
			}

			for (const fieldName of watchFields) {
				const issueMessage = issuesByField.get(fieldName);
				const currentMessage = getFieldState(fieldName).error?.message;

				if (issueMessage) {
					if (currentMessage !== issueMessage) {
						setError(fieldName, { type: "manual", message: issueMessage });
					}
					continue;
				}

				if (currentMessage) {
					clearErrors(fieldName);
				}
			}
		},
		[watchFields, getFieldState, setError, clearErrors],
	);

	const commit = useCallback(async () => {
		const result = await addMovie({
			listId,
			...buildPayload(getValues()),
		});
		if (result.success && result.data) {
			appendMovieToStorage(result.data);
		}
	}, [listId, buildPayload, getValues, appendMovieToStorage]);

	const scheduleCommit = useCallback(() => {
		if (debounceRef.current) {
			clearTimeout(debounceRef.current);
		}

		debounceRef.current = setTimeout(() => {
			void commit();
		}, debounceMs);
	}, [commit, debounceMs]);

	useEffect(() => {
		const watchedValues = Array.isArray(watched) ? watched : [watched];
		if (watchedValues.some((value) => value === undefined)) return;

		const values = getValues();
		const result = schema.safeParse(values);
		if (!result.success) {
			applyValidationResult(result.error.issues);
			return;
		}

		applyValidationResult([]);
		scheduleCommit();

		return () => {
			if (debounceRef.current) {
				clearTimeout(debounceRef.current);
			}
		};
	}, [
		watched,
		getValues,
		schema,
		applyValidationResult,
		scheduleCommit,
	]);

	return {
		register,
		errors,
		storageErrorMessage,
	};
}
