import Link from "next/link";
import ArrowCircleRightIcon from "@/components/ui/Icons/ArrowCircleRightIcon";
import HomeTutorialTtle from "./Title";
import Section from "../Section";
import SectionTitle from "../Section/Title";
import SectionContent from "../Section/Content";

type Props = {
	ItemRegisterForm: React.ReactNode;
	Roulette: React.ReactNode;
};

export default function HomeTutorial({ ItemRegisterForm, Roulette }: Props) {
	return (
		<>
			<div className="bg-background-dark-3 py-12 mb-4">
				<section className="max-w-2xl mx-auto px-4 py-8 pt-12  md:pb-12 md:pt-16">
					<h2 className="w-fit text-5xl sm:text-6xl font-title text-foreground-dark-1 leading-14">
						<HomeTutorialTtle>Collect Movie,&nbsp;</HomeTutorialTtle>
						<HomeTutorialTtle>bit by bit</HomeTutorialTtle>
					</h2>
					<div className="rounded-2xl text-foreground-dark-1 pt-4 text-lg">
						<p>配信サービス、たまったウォッチリスト。</p>
						<p>
							<span className="font-bold pr-1">りすとぽっと</span>
							で整理しましょう🐿️
						</p>
					</div>
				</section>
			</div>

			<Section>
				<SectionTitle>Make a List</SectionTitle>
				<div className="pb-4">
					<h3 className="text-[14px]">
						配信サービスの観たい作品をリスト登録。
					</h3>
				</div>
				<SectionContent>{ItemRegisterForm}</SectionContent>
				<div className="pt-2 flex flex-col items-center gap-2">
					<p className="text-[14px] text-foreground-dark-1">
						以下のサービスから追加できます。
					</p>
					<div className="w-full font-bold text-foreground-dark-1 flex flex-col items-center bg-background-dark-1 rounded-md py-4">
						<div className="flex">
							<span className="inline-block px-4">Netflix</span>/
							<span className="inline-block px-4">U-NEXT</span>
						</div>
						<div className="flex">
							<span className="inline-block px-4">Prime Video</span>/
							<span className="inline-block px-4">Hulu</span>/
							<span className="inline-block px-4">Disney+</span>
						</div>
					</div>
				</div>
			</Section>

			<Section>
				<SectionTitle>Roulette</SectionTitle>
				<div className="pb-4">
					<h3 className="text-[14px]">
						「今日、なに観ようかな」はルーレットへおまかせ。
					</h3>
				</div>
				<SectionContent>{Roulette}</SectionContent>
			</Section>

			<Section>
				<SectionTitle>
					Sign Up,
					<span className="inline-block pl-2">Sync List</span>
				</SectionTitle>
				<div className="pt-2 pb-4">
					<h3 className="text-[14px]">
						ログインすると、ほかのデバイスでも同じリストを使えます。
					</h3>
				</div>
				<SectionContent>
					<div className="pt-6">
						<Link
							href="/login"
							className="w-full flex gap-2 justify-center items-center py-4 bg-background-dark-1 rounded-full border border-background-light-1 hover:bg-background-light-1 hover:border-background-light-2 transition-all"
						>
							<span className="font-bold text-foreground-dark-1">
								アカウント登録 or ログイン
							</span>
							<span className="text-foreground-dark-2">
								<ArrowCircleRightIcon className="size-6" />
							</span>
						</Link>
					</div>
				</SectionContent>
			</Section>
		</>
	);
}
