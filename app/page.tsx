import { headers } from "next/headers";
import { currentUserPublicListId } from "@/features/shared/actions/currentUserPublicListId";
import { getCurrentUserMovieList } from "@/features/list/actions/getCurrentUserMovieList";
import MovieInputForm from "./components/MovieInputForm";
import Roulette from "./components/Roulette";
import Section from "@/components/Section";

export default async function Home() {
	const result = await currentUserPublicListId();
	const publicListId = result.success ? result.data.publicListId : null;

	const items = publicListId
		? await getCurrentUserMovieList(publicListId)
		: null;

	if (items?.success === false) {
		throw new Error(items.error.message);
	}

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
					items={items?.data}
					publicListId={publicListId}
				/>
			</Section>
			<Section title="今日、なに観る？">
				<Roulette items={items?.data} />
			</Section>
		</>
	);
}
