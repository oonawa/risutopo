import Form from "@/components/Form";

export default function PcForm() {
	return (
		<div className="w-full md:px-10 flex flex-col justify-center items-center">
			<div className="w-full flex flex-col gap-4">
				<div className="flex flex-col gap-4 relative">
					<div className="text-foreground-dark-2 flex justify-center py-2 font-medium">
						作品のタイトル・視聴URLを入力
					</div>
					<Form placeholder="ジュラシック・パーク" id="title" name="title" />
					<Form
						className="min-h-[3lh] break-all"
						placeholder="https://www.netflix.com/jp/title/60002360?s=i&trkid=258593161&vlang=ja&trg=cp"
						id="watch-url"
						name="watch-url"
					/>
				</div>
			</div>
		</div>
	);
}
