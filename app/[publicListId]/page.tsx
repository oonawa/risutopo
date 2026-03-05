import { redirect } from "next/navigation";
import { isAuthenticated } from "@/features/auth/services/session";
import UserMovieList from "./components/List";

type Props = {
	params: Promise<{
		publicListId: string;
	}>;
};

export default async function MovieList({ params }: Props) {
	const isVerified = await isAuthenticated();

	if (!isVerified) {
		redirect("/login");
	}
	const { publicListId } = await params;

	return (
		<main className="max-w-240 mx-auto pt-10 pb-4 ">
			<UserMovieList publicListId={publicListId} />
		</main>
	);
}
