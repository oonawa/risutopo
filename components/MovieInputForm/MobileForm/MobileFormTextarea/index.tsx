"use client";

import Form from "@/components/MovieInputForm/Form";
import { movieShareLinkSchema } from "@/app/movieShareLinkSchema";
import { useMovieInputForm } from "@/app/hooks/useMovieInputForm";
import type { FieldPath } from "react-hook-form";
import type { infer as ZodInfer } from "zod";

type Props = {
	listId: number | null;
};

type MovieShareLinkValues = ZodInfer<typeof movieShareLinkSchema>;

const WATCH_FIELDS: FieldPath<MovieShareLinkValues>[] = ["value"];
const buildMobilePayload = (values: MovieShareLinkValues) => ({
	mobile: {
		shareLink: values.value,
	},
});

export default function MobileFormTextarea({ listId }: Props) {
	const { register, errors, storageErrorMessage } = useMovieInputForm({
		schema: movieShareLinkSchema,
		watchFields: WATCH_FIELDS,
		listId,
		buildPayload: buildMobilePayload,
	});
	const valueErrorMessage =
		typeof errors.value?.message === "string" ? errors.value.message : "";

	return (
		<>
			<Form
				className="min-h-[calc(4lh+(calc(var(--spacing)*4)))] placeholder-shown:text-ellipsis placeholder-shown:overflow-hidden wrap-break-word"
				placeholder="「 ジュラシック・パーク 」 をNetflix で今 す ぐチ ェ ッ クhttps://www.netflix.com/jp/title/60002360?s=i&trkid=258593161&vlang=ja&trg=more"
				{...register("value")}
			/>
			{valueErrorMessage && (
				<p className="text-sm text-red-500">{valueErrorMessage}</p>
			)}
			{storageErrorMessage && (
				<p className="text-sm text-red-500">{storageErrorMessage}</p>
			)}
		</>
	);
}
