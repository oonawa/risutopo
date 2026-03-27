import dayjs from "dayjs";

export default function Footer() {
	return (
		<footer className="pb-[calc(var(--navigation-bottom)+var(--navigation-height)+1rem)] pt-8 bg-background-dark-1 text-foreground-dark-1">
			<div className="w-full sm:max-w-4xl mx-auto px-4">
				<div className="flex flex-col md:flex-row md:justify-between gap-8 pb-10">
					<div className="flex flex-col gap-2">
						<a href="/">
							<span className="text-xl font-bold">りすとぽっと</span>
						</a>
						<p className="text-sm text-foreground-dark-2">
							観たいものがありすぎる人のウォッチリスト整理ツール
						</p>
					</div>

					<ul className="flex flex-col md:flex-row gap-2 md:gap-4">
						<li>
							<a href="/?home=true" className="hover:text-foreground">
								ホーム
							</a>
						</li>
						<li>
							<a href="/about" className="hover:text-foreground">
								どんなもの？
							</a>
						</li>
						<li>
							<a href="/terms" className="hover:text-foreground">
								利用規約
							</a>
						</li>
						<li>
							<a href="/privacy" className="hover:text-foreground">
								プライバシー
							</a>
						</li>
					</ul>
				</div>

				<div className="flex">
					<p className="text-xs text-foreground-dark-2">
						<span>©</span>
						<span>{dayjs().year()}</span>
						<span className="pl-2">oonawa</span>
					</p>
				</div>
			</div>
		</footer>
	);
}
