import Tutorial from "../Tutorial";
import TutorialContent from "../Tutorial/Content";
import MobileFormTextarea from "./MobileFormTextarea";

export default function MobileForm() {
	return (
		<div className="w-full md:px-10 flex flex-col justify-center items-center">
			<div className="w-full flex flex-col gap-4">
				<div className="text-foreground-dark-2 flex justify-center py-2 font-medium">
					作品の共有リンクをペースト
				</div>
				<MobileFormTextarea />
			</div>

			<Tutorial title="共有リンクの取得方法">
				<TutorialContent />
			</Tutorial>
		</div>
	);
}
