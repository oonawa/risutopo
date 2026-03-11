import { isAuthenticated } from "@/features/auth/services/session";
import { getUserMovieList } from "@/features/list/actions/getUserMovieList";
import { notFound } from "next/navigation";
import ListContainer from "./Container";
import ListItemDetail from "./Item/Detail";
import ListItem from "./Item";
import LocalList from "../LocalList";

type Props = {
	publicListId: string;
};

export default async function UserMovieList({ publicListId }: Props) {
	const payload = await isAuthenticated();

	if (!payload) {
		return <LocalList publicListId={publicListId} />;
	}

	const moviesResult = await getUserMovieList(publicListId, payload.userId);

	if (!moviesResult.success) {
		if (
			moviesResult.error.code === "FORBIDDEN_ERROR" ||
			moviesResult.error.code === "NOT_FOUND_ERROR"
		) {
			notFound();
		}

		return null;
	}

	if (moviesResult.data.length === 0) {
		return <LocalList publicListId={publicListId} />;
	}

	return (
		<>
			<ListContainer>
				{moviesResult.data.map((movie) => {
					return <ListItem key={movie.listItemId} movie={movie} />;
				})}
			</ListContainer>
			<ListItemDetail publicListId={publicListId} />
		</>
	);
}
