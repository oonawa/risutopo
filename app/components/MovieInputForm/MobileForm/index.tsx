import type z from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Tutorial from "../Tutorial";
import TutorialContent from "../Tutorial/Content";
import { movieShareLinkSchema } from "@/app/movieShareLinkSchema";
import FormTextarea from "../FormTextarea";
import FormSubmitButton from "../FormSubmitButton";

type MovieShareLinkValue = z.infer<typeof movieShareLinkSchema>;

type Props = {
	disabled: boolean;
	onSubmit: (input: { shareLink: string; isValid: boolean }) => Promise<void>;
	storageErrorMessage: string | null;
};

export default function MobileForm({
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
	} = useForm<MovieShareLinkValue>({
		resolver: zodResolver(movieShareLinkSchema),
		mode: "onChange",
	});

	const [value] = useWatch({
		control,
		name: ["value"],
		defaultValue: { value: "" },
	});

	return (
		<div className="w-full md:px-10 flex flex-col justify-center items-center">
			<div className="w-full flex flex-col gap-4">
				<div className="flex justify-center pt-2 pb-4 font-medium">
					作品の共有リンクで登録
				</div>
				<FormTextarea
					className="min-h-[calc(4lh+(calc(var(--spacing)*4)))] placeholder-shown:text-ellipsis placeholder-shown:overflow-hidden wrap-break-word"
					placeholder="「 ジュラシック・パーク 」 をNetflix で今 す ぐチ ェ ッ クhttps://www.netflix.com/jp/title/60002360?s=i&trkid=258593161&vlang=ja&trg=more"
					disabled={disabled}
					{...register("value")}
				/>
				{errors.value && <p>{errors.value.message}</p>}
				{storageErrorMessage && <p>{storageErrorMessage}</p>}
			</div>

			<Tutorial title="共有リンクの取得方法">
				<TutorialContent />
			</Tutorial>

			<FormSubmitButton
				className="w-full sm:w-fit"
				onClick={async () => {
					await onSubmit({ shareLink: getValues("value"), isValid });
					setValue("value", "");
				}}
				disabled={!value || !isValid || disabled}
			/>
		</div>
	);
}
