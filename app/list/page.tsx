import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { getUserMovieList } from "./actions/getUserMovieList";
import ListItemDetail from "./components/List/Item/Detail";

export default async function MovieList() {
	const isVerified = await isAuthenticated();

	if (!isVerified) {
		redirect("/login");
	}

	const userMovieList = await getUserMovieList(isVerified.userId);

	return (
		<main className="max-w-240 mx-auto pt-10 pb-4">
			{userMovieList.length ? (
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 px-4 sm:px-0">
				{userMovieList.map((movie, index) => (
					<div key={`${index}-${movie.title}`}>
						<ListItemDetail
							title={movie.title}
							serviceName={movie.serviceName}
							watchUrl={movie.watchUrl}
						/>
					</div>
				))}
			</div>
			): (
				<div>観たい作品をここへ集めましょう！</div>
			)}
		</main>
	);
}
