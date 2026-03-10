import { getUserMovieList } from "@/features/list/actions/getUserMovieList";
import ListContainer from "./Container";
import ListItemDetail from "./Item/Detail";
import ListItem from "./Item";
import LocalList from "../LocalList";

type Props = {
	publicListId: string;
};

export default async function UserMovieList({ publicListId }: Props) {
	const moviesResult = await getUserMovieList(publicListId);

	if (!moviesResult.success) {
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
