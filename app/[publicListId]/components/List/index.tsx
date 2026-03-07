import { getUserMovieList } from "@/features/list/actions/getUserMovieList";
import ListItemDetail from "./Item/Detail";
import ListItem from "./Item";

type Props = {
	publicListId: string;
};

export default async function UserMovieList({ publicListId }: Props) {
	const moviesResult = await getUserMovieList(publicListId);

	if (!moviesResult.success) {
		return null;
	}

	return (
		<>
			<div className="flex flex-wrap justify-start pl-0 sm:pl-5">
				{moviesResult.data.map((movie) => {
					return <ListItem key={movie.listItemId} movie={movie} />;
				})}
			</div>
			<ListItemDetail publicListId={publicListId} />
		</>
	);
}
