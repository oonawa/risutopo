import { headers } from "next/headers";
import MovieTitleForm from "@/components/MovieInputForm";
import PcForm from "@/components/MovieInputForm/PcForm";
import MobileForm from "@/components/MovieInputForm/MobileForm";

export default async function Home() {
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
				PcForm={<PcForm />}
				MobileForm={<MobileForm />}
			/>
		</div>
	);
}
