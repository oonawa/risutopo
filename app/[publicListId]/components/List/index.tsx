import type { ListItem } from "@/features/list/types/ListItem";
import ListContainer from "./Container";
import ListItemDetail from "./Item/Detail";
import ListItemCard from "./Item";

type Props = {
	publicListId: string;
	items: ListItem[];
};

export default async function List({ publicListId, items }: Props) {
	return (
		<>
			<ListContainer>
				{items.map((movie) => {
					return <ListItemCard key={movie.listItemId} movie={movie} />;
				})}
			</ListContainer>
			<ListItemDetail publicListId={publicListId} />
		</>
	);
}
