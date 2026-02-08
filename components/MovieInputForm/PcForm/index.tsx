"use client";

import type z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import Form from "@/components/MovieInputForm/Form";
import { movieInfoSchema } from "@/app/movieInfoSchema";
import { addMovie } from "@/app/actions/addMovie";

type Props = {
	listId: number | null;
};

export default function PcForm({ listId }: Props) {
	const {
		register,
		formState: { errors },
		control,
		trigger,
	} = useForm<z.infer<typeof movieInfoSchema>>({
		resolver: zodResolver(movieInfoSchema),
		mode: "onChange",
	});

	const handleSubmit = useCallback(
		async (title: string, url: string) => {
			if (listId === null) return;
			const data = await addMovie({
				listId,
				browser: {
					title,
					url,
				},
			});
			console.log(data)
		},
		[listId],
	);

	const title = useWatch({ control, name: "title" });
	const url = useWatch({ control, name: "url" });
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		if (title === undefined || url === undefined) return;
		let canceled = false;

		const run = async () => {
			const isValid = await trigger(["title", "url"]);
			if (!isValid || canceled) return;

			if (debounceRef.current) {
				clearTimeout(debounceRef.current);
			}

			debounceRef.current = setTimeout(() => {
				void handleSubmit(title, url);
			}, 400);
		};

		void run();

		return () => {
			canceled = true;
			if (debounceRef.current) {
				clearTimeout(debounceRef.current);
			}
		};
	}, [title, url, trigger, handleSubmit]);

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
					{errors.title && (
						<p className="text-sm text-red-500">{errors.title.message}</p>
					)}
					<Form
						className="min-h-[3lh] break-all"
						placeholder="https://www.netflix.com/jp/title/60002360?s=i&trkid=258593161&vlang=ja&trg=cp"
						id="watch-url"
						{...register("url")}
					/>
					{errors.url && (
						<p className="text-sm text-red-500">{errors.url.message}</p>
					)}
				</div>
			</div>
		</div>
	);
}
