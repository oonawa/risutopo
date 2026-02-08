"use client";

import Form from "@/components/MovieInputForm/Form";
import { movieInfoSchema } from "@/app/movieInfoSchema";
import { useMovieInputForm } from "@/app/hooks/useMovieInputForm";
import type { FieldPath } from "react-hook-form";
import type { infer as ZodInfer } from "zod";

type Props = {
	listId: number | null;
};

type MovieInfoValues = ZodInfer<typeof movieInfoSchema>;

const WATCH_FIELDS: FieldPath<MovieInfoValues>[] = ["title", "url"];
const buildBrowserPayload = (values: MovieInfoValues) => ({
	browser: {
		title: values.title,
		url: values.url,
	},
});

export default function PcForm({ listId }: Props) {
	const { register, errors, storageErrorMessage } = useMovieInputForm({
		schema: movieInfoSchema,
		watchFields: WATCH_FIELDS,
		listId,
		buildPayload: buildBrowserPayload,
	});
	const titleErrorMessage =
		typeof errors.title?.message === "string" ? errors.title.message : "";
	const urlErrorMessage =
		typeof errors.url?.message === "string" ? errors.url.message : "";

	return (
		<div className="w-full md:px-10 flex flex-col justify-center items-center">
			<div className="w-full flex flex-col gap-4">
				<div className="flex flex-col gap-4 relative">
					<div className="text-foreground-dark-2 flex justify-center py-2 font-medium">
						作品のタイトル・視聴URLを入力
					</div>
					<Form
						placeholder="ジュラシック・パーク"
						id="title"
						{...register("title")}
					/>
					{titleErrorMessage && (
						<p className="text-sm text-red-500">{titleErrorMessage}</p>
					)}
					<Form
						className="min-h-[3lh] break-all"
						placeholder="https://www.netflix.com/jp/title/60002360?s=i&trkid=258593161&vlang=ja&trg=cp"
						id="watch-url"
						{...register("url")}
					/>
					{urlErrorMessage && (
						<p className="text-sm text-red-500">{urlErrorMessage}</p>
					)}
					{storageErrorMessage && (
						<p className="text-sm text-red-500">{storageErrorMessage}</p>
					)}
				</div>
			</div>
		</div>
	);
}
