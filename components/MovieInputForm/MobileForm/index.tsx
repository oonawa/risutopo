import Form from "@/components/Form";
import Tutorial from "../Tutorial";
import TutorialContent from "../Tutorial/Content";

export default function MobileForm() {
	return (
		<div className="w-full md:px-10 flex flex-col justify-center items-center">
			<div className="w-full flex flex-col gap-4">
				<div className="text-foreground-dark-2 flex justify-center py-2 font-medium">
					作品の共有リンクをペースト
				</div>
				<Form
					className="break-all min-h-[3lh]"
					placeholder="「 ジュラシック・パーク 」 をNetflix で今 す ぐチ ェ ッ クhttps://www.netflix.com/jp/title/60002360?s=i&trkid=258593161&vlang=ja&trg=more"
				/>
			</div>
			<Tutorial title="共有リンクの取得方法">
				<TutorialContent />
			</Tutorial>
		</div>
	);
}
