import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import UserMovieList from "./components/List";

export default async function MovieList() {
	const isVerified = await isAuthenticated();

	if (!isVerified) {
		redirect("/login");
	}

	return (
		<main className="max-w-240 mx-auto pt-10 pb-4 ">
			<UserMovieList userId={isVerified.userId} />
		</main>
	);
}
