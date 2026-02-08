"use client";

import type z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import Form from "@/components/MovieInputForm/Form";
import { addMovie } from "@/app/actions/addMovie";
import { movieShareLinkSchema } from "@/app/movieShareLinkSchema";

type MovieShareLinkData = z.infer<typeof movieShareLinkSchema>;

type Props = {
	listId: number | null;
};

export default function MobileFormTextarea({ listId }: Props) {
	const {
		register,
		formState: { errors },
		control,
		trigger,
	} = useForm<MovieShareLinkData>({
		resolver: zodResolver(movieShareLinkSchema),
		mode: "onChange",
	});

	const handleListRegistration = useCallback(
		async (shareLink: string) => {
			if (listId === null) return;
			const data = await addMovie({
				listId,
				mobile: {
					shareLink,
				},
			});
		},
		[listId],
	);

	const shareLink = useWatch({ control, name: "value" });
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		if (shareLink === undefined) return;
		let canceled = false;

		const run = async () => {
			const isValid = await trigger("value");
			if (!isValid || canceled) return;

			if (debounceRef.current) {
				clearTimeout(debounceRef.current);
			}

			debounceRef.current = setTimeout(() => {
				void handleListRegistration(shareLink);
			}, 400);
		};

		void run();

		return () => {
			canceled = true;
			if (debounceRef.current) {
				clearTimeout(debounceRef.current);
			}
		};
	}, [shareLink, trigger, handleListRegistration]);

	return (
		<>
			<Form
				className="min-h-[calc(4lh+(calc(var(--spacing)*4)))] placeholder-shown:text-ellipsis placeholder-shown:overflow-hidden wrap-break-word"
				placeholder="「 ジュラシック・パーク 」 をNetflix で今 す ぐチ ェ ッ クhttps://www.netflix.com/jp/title/60002360?s=i&trkid=258593161&vlang=ja&trg=more"
				{...register("value")}
			/>
			{errors.value && (
				<p className="text-sm text-red-500">{errors.value.message}</p>
			)}
		</>
	);
}
