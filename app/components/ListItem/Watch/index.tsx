import type { DraftListItem, ListItem } from "@/features/list/types/ListItem";
import Content from "../Content";
import ServiceName from "../Content/ServiceName";
import Menu from "../Content/Menu";
import SubMenu from "../Content/SubMenu";
import WatchButton from "../Content/WatchButton";
import Overview from "../Content/Overview";

type Props = {
	movie: DraftListItem | ListItem;
	isSearchPending: boolean;
	isRemovePending: boolean;
	handleSearch: () => void;
	handleRemove: () => void;
};

export default function WatchListItem({
	movie,
	isSearchPending,
	isRemovePending,
	handleSearch,
	handleRemove,
}: Props) {
	return (
		<Content
			movie={movie}
			isSearchPending={isSearchPending}
			onSearch={handleSearch}
		>
			<ServiceName serviceName={movie.serviceName} />

			<Menu
				Button={<WatchButton url={movie.url} />}
				SubMenu={
					<SubMenu
						onSearch={handleSearch}
						onRemove={handleRemove}
						searchDisabled={isSearchPending}
						removeDisabled={isRemovePending}
					/>
				}
			/>
			{movie.details && <Overview overview={movie.details.overview} />}
		</Content>
	);
}
