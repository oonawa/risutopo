import { headers } from "next/headers";
import { getUserMovieListPublicId } from "@/features/list/actions/getUserMovieListPublicId";
import MovieInputForm from "./components/MovieInputForm";
import Roulette from "./components/Roulette";
import { isAuthenticated } from "@/features/auth/services/session";
import Section from "@/components/Section";

export default async function Home() {
	const isVerified = await isAuthenticated();
	const publicListId = isVerified
		? await getUserMovieListPublicId(isVerified.userId)
		: null;

	const headersList = await headers();
	const userAgent = headersList.get("user-agent") || "";

	const isMobileUA = /Android|iPhone|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
		userAgent,
	);

	return (
		<>
			<Section title="リストへ追加">
				<MovieInputForm
					initialIsMobile={isMobileUA}
					userAgent={userAgent}
					publicListId={publicListId}
				/>
			</Section>
			<Section title="今日、なに観る？">
				<Roulette />
			</Section>
		</>
	);
}
