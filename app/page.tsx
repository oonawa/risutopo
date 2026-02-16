import { headers } from "next/headers";
import { getUserMovieListId } from "@/app/actions/getUserMovieListId";
import MovieInputForm from "./components/MovieInputForm";
import { isAuthenticated } from "@/lib/auth";

export default async function Home() {
	const isVerified = await isAuthenticated();
	const listId = isVerified ? await getUserMovieListId(isVerified.userId) : null;

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
