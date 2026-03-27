import dynamic from "next/dynamic";
import { headers } from "next/headers";
import { currentUserPublicListId } from "@/features/shared/actions/currentUserPublicListId";
import { getCurrentUserMovieList } from "@/features/list/actions/getCurrentUserMovieList";
import Section from "./components/Section";
import SectionTitle from "./components/Section/Title";
import HomeTutorial from "./components/HomeTutorial";

const MovieInputForm = dynamic(() => import("./components/MovieInputForm"));
const Roulette = dynamic(() => import("./components/Roulette"));

type Props = {
	searchParams?: Promise<{
		home?: string;
	}>;
};

export default async function HomePage({ searchParams }: Props) {
	const params = await searchParams;
	const homeWithTutorial = params?.home === "true";

	const result = await currentUserPublicListId();
	const isLoggedIn = result.success;

	const headersList = await headers();
	const userAgent = headersList.get("user-agent") || "";

	const isMobileUA = /Android|iPhone|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
		userAgent,
	);

	if (!isLoggedIn && !homeWithTutorial) {
		return (
			<HomeTutorial
				ItemRegisterForm={
					<MovieInputForm
						initialIsMobile={isMobileUA}
						userAgent={userAgent}
						publicListId={null}
					/>
				}
				Roulette={<Roulette />}
			/>
		);
	}

	const publicListId = result.success ? result.data.publicListId : null;

	const items = publicListId
		? await getCurrentUserMovieList(publicListId)
		: null;

	if (items?.success === false) {
		throw new Error(items.error.message);
	}

	if (homeWithTutorial) {
		return (
			<HomeTutorial
				ItemRegisterForm={
					<MovieInputForm
						initialIsMobile={isMobileUA}
						userAgent={userAgent}
						items={items?.data}
						publicListId={publicListId}
					/>
				}
				Roulette={<Roulette items={items?.data} />}
			/>
		);
	}

	return (
		<>
			<Section>
				<SectionTitle>Make a List</SectionTitle>
				<MovieInputForm
					initialIsMobile={isMobileUA}
					userAgent={userAgent}
					items={items?.data}
					publicListId={publicListId}
				/>
			</Section>
			<Section>
				<SectionTitle>Roulette</SectionTitle>
				<Roulette items={items?.data} />
			</Section>
		</>
	);
}
