import { headers } from "next/headers";
import { verifySessionToken } from "@/lib/auth";
import { getUserMovieList } from "@/app/actions/getUserMovieListId";
import MovieInputForm from "./components/MovieInputForm";

export default async function Home() {
	const isVerified = await verifySessionToken();
	const listId = isVerified ? await getUserMovieList(isVerified.userId) : null;

	const headersList = await headers();
	const userAgent = headersList.get("user-agent") || "";

	const isMobileUA = /Android|iPhone|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
		userAgent,
	);

	return (
		<div className="h-dvh w-dvw flex items-center justify-center">
			<MovieInputForm
				initialIsMobile={isMobileUA}
				userAgent={userAgent}
				listId={listId}
			/>
		</div>
	);
}
