import type { ListItem } from "@/features/list/types/ListItem";
import Content from "../Content";
import ServiceName from "../Content/ServiceName";
import WatchButton from "../Content/WatchButton";
import Menu from "../Content/Menu";

type Props = {
	movie: ListItem;
};

export default function DrawnListItem({ movie }: Props) {
	return (
		<Content movie={movie}>
			<ServiceName serviceName={movie.serviceName} />
			<Menu Button={<WatchButton url={movie.url} />} />
		</Content>
	);
}
