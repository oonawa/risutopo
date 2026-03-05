import { headers } from "next/headers";
import { getUserMovieListPublicId } from "@/features/list/actions/getUserMovieListPublicId";
import MovieInputForm from "./components/MovieInputForm";
import { isAuthenticated } from "@/features/auth/services/session";

export default async function Home() {
	const isVerified = await isAuthenticated();
	const listPublicId = isVerified
		? await getUserMovieListPublicId(isVerified.userId)
		: null;

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
				listPublicId={listPublicId}
			/>
		</div>
	);
}
