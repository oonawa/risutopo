import { Suspense } from "react";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Menu from "@/components/Menu";
import "./globals.css";

export const metadata: Metadata = {
	metadataBase: new URL(
		process.env.VERCEL_PROJECT_PRODUCTION_URL
			? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
			: "http://localhost:3000",
	),
	title: {
		default: "りすとぽっと｜映画ファンのためのウォッチリスト整理ツール",
		template: "%s｜りすとぽっと",
	},
	description:
		"観たい配信映画をまとめて管理。サービスをまたいで自由にリストを作ったり、選び疲れたらルーレットでランダム抽選できます。",
	openGraph: {
		title: "りすとぽっと｜映画ファンのためのウォッチリスト整理ツール",
		description:
			"観たい配信映画をまとめて管理。サービスをまたいで自由にリストを作ったり、選び疲れたらルーレットでランダム抽選できます。",
		images: "/og.png",
	},
	twitter: {
		card: "summary",
	},
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="ja">
			<head>
				<meta name="apple-mobile-web-app-title" content="りすとぽっと" />
			</head>
			<body className={`antialiased`}>
				<Header />

				<main className="min-h-[calc(100dvh-var(--header-height))] pb-20">
					{children}
				</main>

				<Footer />

				<Suspense fallback={null}>
					<Menu />
				</Suspense>
			</body>
		</html>
	);
}
