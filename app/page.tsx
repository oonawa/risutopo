import { headers } from "next/headers";
import { verifySessionToken } from "@/lib/auth";
import { getUserList } from "@/app/actions/getUserListId";
import MovieTitleForm from "@/components/MovieInputForm";
import PcForm from "@/components/MovieInputForm/PcForm";
import MobileForm from "@/components/MovieInputForm/MobileForm";

export default async function Home() {
	const isVerified = await verifySessionToken();
	const listId = isVerified ? await getUserList(isVerified.userId) : null;

	const headersList = await headers();
	const userAgent = headersList.get("user-agent") || "";

	const isMobileUA = /Android|iPhone|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
		userAgent,
	);

	return (
		<div className="h-dvh w-dvw flex items-center justify-center">
			<MovieTitleForm
				initialIsMobile={isMobileUA}
				userAgent={userAgent}
				PcForm={<PcForm listId={listId} />}
				MobileForm={<MobileForm listId={listId} />}
			/>
		</div>
	);
}
