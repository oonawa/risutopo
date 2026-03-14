import { headers } from "next/headers";
import { currentUserPublicListId } from "@/features/shared/actions/currentUserPublicListId";
import MovieInputForm from "./components/MovieInputForm";
import Roulette from "./components/Roulette";
import Section from "@/components/Section";

export default async function Home() {
	const result = await currentUserPublicListId();
	const publicListId = result.success ? result.data.publicListId : null;

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
