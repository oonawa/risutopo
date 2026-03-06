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

	return <UserMovieList publicListId={publicListId} />;
}
