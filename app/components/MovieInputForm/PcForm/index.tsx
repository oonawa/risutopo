"use client";

import { useState } from "react";
import type z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { movieInfoSchema } from "@/app/movieInfoSchema";
import FormTextarea from "../FormTextarea";
import FormSubmitButton from "../FormSubmitButton";

type MovieInfoValues = z.infer<typeof movieInfoSchema>;

type Props = {
	onSubmit: (input: {
		values: MovieInfoValues;
		isValid: boolean;
	}) => void;
	storageErrorMessage: string | null;
};

export default function PcForm({ onSubmit, storageErrorMessage }: Props) {
	const [formDisabled, setFormDisabled] = useState(false);

	const {
		register,
		getValues,
		formState: { errors, isValid },
	} = useForm<MovieInfoValues>({
		resolver: zodResolver(movieInfoSchema),
		mode: "onChange",
	});

	return (
		<div className="w-full md:px-10 flex flex-col justify-center items-center">
			<div className="w-full flex flex-col gap-4">
				<div className="flex flex-col gap-4 relative">
					<div className="text-foreground-dark-2 flex justify-center py-2 font-medium">
						作品のタイトル・視聴URLを入力
					</div>
					<FormTextarea
						placeholder="ジュラシック・パーク"
						id="title"
						disabled={formDisabled}
						{...register("title")}
					/>
					{errors.title && <p>{errors.title.message}</p>}
					<FormTextarea
						className="min-h-[3lh] break-all"
						placeholder="https://www.netflix.com/jp/title/60002360?s=i&trkid=258593161&vlang=ja&trg=cp"
						id="watch-url"
						disabled={formDisabled}
						{...register("url")}
					/>
					{errors.url && <p>{errors.url.message}</p>}
					{storageErrorMessage && <p>{storageErrorMessage}</p>}
				</div>
			</div>

			<FormSubmitButton
				onClick={() => {
					setFormDisabled(true)
					onSubmit({ values: getValues(), isValid });
				}}
				disabled={!isValid || formDisabled}
			/>
		</div>
	);
}
