import type z from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { movieInfoSchema } from "@/app/movieInfoSchema";
import FormTextarea from "../FormTextarea";
import FormSubmitButton from "../FormSubmitButton";

type MovieInfoValues = z.infer<typeof movieInfoSchema>;

type Props = {
	disabled: boolean;
	onSubmit: (input: {
		values: MovieInfoValues;
		isValid: boolean;
	}) => Promise<void>;
	storageErrorMessage: string | null;
};

export default function PcForm({
	disabled,
	onSubmit,
	storageErrorMessage,
}: Props) {
	const {
		register,
		getValues,
		setValue,
		control,
		formState: { errors, isValid },
	} = useForm<MovieInfoValues>({
		resolver: zodResolver(movieInfoSchema),
		mode: "onChange",
	});

	const [title, url] = useWatch({
		control,
		name: ["title", "url"],
		defaultValue: { title: "", url: "" },
	});

	return (
		<div className="w-full md:px-10 flex flex-col justify-center items-center">
			<div className="w-full flex flex-col gap-4">
				<div className="flex flex-col gap-4 relative">
					<div className="flex justify-center py-2 font-medium">
						作品のタイトル・視聴URLを入力
					</div>
					<FormTextarea
						placeholder="ジュラシック・パーク"
						id="title"
						disabled={disabled}
						{...register("title")}
					/>
					{errors.title && <p>{errors.title.message}</p>}
					<FormTextarea
						className="min-h-[3lh] break-all"
						placeholder="https://www.netflix.com/jp/title/60002360?s=i&trkid=258593161&vlang=ja&trg=cp"
						id="watch-url"
						disabled={disabled}
						{...register("url")}
					/>
					{errors.url && <p>{errors.url.message}</p>}
					{storageErrorMessage && <p>{storageErrorMessage}</p>}
				</div>
			</div>

			<FormSubmitButton
				onClick={async () => {
					await onSubmit({ values: getValues(), isValid });
					setValue("title", "");
					setValue("url", "");
				}}
				disabled={!title || !url || !isValid || disabled}
			/>
		</div>
	);
}
