export default function AboutPage() {
	return (
		<section className="max-w-xl mx-auto px-4 pb-8 pt-14 md:pb-12 md:pt-18">
			<h2 className="text-5xl sm:text-6xl font-title text-foreground-dark-2">
				About
			</h2>
			<p className="mt-6 leading-[1.65rem]">
				りすとぽっとは、観たい配信作品を整理するサービスです。
				<br />
				日本の福岡県に住む
				<span className="px-1">oonawa</span>
				が個人で開発しています。
			</p>
			<p className="mt-4">
				映画が見放題の配信サービスを利用していると、リストの作品が増えていきます。
			</p>
			<p>
				あらすじを読んでふと気になったり、友人がオススメしてくれたときなど。
			</p>
			<p className="mt-4">
				しかし時間があるときに「なにか観よう」と思っても、サービスごとに膨れ上がったリストから作品を選ぶのが大変でした。
			</p>

			<ul className="my-6 pl-6 list-disc">
				<li className="pl-1 marker:text-[1.1rem] marker:text-foreground-dark-2">
					使っているサービスをまたいだ「自分用のウォッチリスト」を作りたい。
				</li>
				<li className="pl-1 marker:text-[1.1rem] marker:text-foreground-dark-2">
					なんでもいい気分のときは観るものをランダムに決めたい。
				</li>
				<li className="pl-1 marker:text-[1.1rem] marker:text-foreground-dark-2">
					音楽や動画のアプリみたいに、自由にいろいろなリストを作りたい。
				</li>
			</ul>

			<p className="mt-4">
				最初は既存のツールでリストを作ろうと思いましたが、データの入力が手間に感じられたり、ランダムに映画を取り出すことができませんでした。
			</p>
			<p className="mt-4">
				自分が求めるものは実現するには作ってしまうのが一番はやいと考え、開発を始めました。
			</p>
		</section>
	);
}
