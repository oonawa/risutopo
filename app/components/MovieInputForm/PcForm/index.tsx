import type z from "zod";
import type { ListItem } from "@/features/list/types/ListItem";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { movieEntrySchema } from "@/features/list/schemas/movieEntrySchema";
import { useExtractMovieInfo } from "@/features/list/hooks/useExtractMovieInfo";
import { Button } from "@/components/ui/button";
import FormTextarea from "../FormTextarea";

type MovieEntryValues = z.infer<typeof movieEntrySchema>;

type Props = {
	disabled: boolean;
	handleExtract: (extracted: ListItem | null) => void;
};

export default function PcForm({ disabled, handleExtract }: Props) {
	const {
		register,
		getValues,
		setValue,
		formState: { errors, isValid },
	} = useForm<MovieEntryValues>({
		resolver: zodResolver(movieEntrySchema),
		mode: "onChange",
	});

	const { extractMovieInfoFromBrowser } = useExtractMovieInfo();

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
				</div>
			</div>

			<div className="w-full flex justify-end pt-4">
				<Button
					className="border-background-light-3 hover:border-background-light-4 hover:bg-background-light-1"
					variant={"outline"}
					onClick={() => {
						if (!isValid) {
							handleExtract(null);
							return;
						}

						const extracted = extractMovieInfoFromBrowser(getValues());
						handleExtract(extracted);

						setTimeout(() => {
							setValue("title", "");
							setValue("url", "");
						}, 1000);
					}}
				>
					登録
				</Button>
			</div>
		</div>
	);
}
