import dayjs from "dayjs";

export default function Footer() {
	return (
		<footer className="pb-[calc(var(--navigation-bottom)+var(--navigation-height)+1rem)] pt-6 bg-background-dark-1 text-foreground-dark-1">
			<div className="w-full sm:max-w-4xl mx-auto px-4">
				<div className="flex flex-col md:flex-row md:justify-between gap-8 pb-10">
					<div className="flex flex-col gap-2">
						<a href="/">
							<span className="text-xl font-bold">りすとぽっと</span>
						</a>
						<p className="text-foreground-dark-2">
							映画をたくさん観る人の作品管理ツール
						</p>
					</div>

					<ul className="flex gap-4">
						<li>
							<a href="/?home=true">ホーム</a>
						</li>
						<li>
							<a href="/about">使い方</a>
						</li>
						<li>
							<a href="/terms">利用規約</a>
						</li>
						<li>
							<a href="/privacy">プライバシー</a>
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
