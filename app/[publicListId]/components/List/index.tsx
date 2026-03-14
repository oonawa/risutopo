import { currentUserId } from "@/features/shared/actions/currentUserId";
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
	const result = await currentUserId();

	if (!result.success) {
		return <LocalList publicListId={publicListId} />;
	}

	const moviesResult = await getUserMovieList(publicListId, result.data.userId);

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
