import { getUserMovieList } from "@/app/list/actions/getUserMovieList";
import ListItemDetail from "./Item/Detail";
import ListItem from "./Item";

type Props = {
	userId: number;
};

export default async function UserMovieList({ userId }: Props) {
	const { movies, listId } = await getUserMovieList(userId);

	return (
		<>
			<div className="flex flex-wrap justify-start pl-0 sm:pl-5">
				{movies.map((movie) => {
					return <ListItem key={movie.listItemId} movie={movie} />;
				})}
			</div>
			<ListItemDetail listId={listId} />
		</>
	);
}
