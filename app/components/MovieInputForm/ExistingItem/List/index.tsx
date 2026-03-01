import type { DuplicateListItem } from "@/app/types/MovieInputForm/DuplicaateItem";
import ExistingListItemDetail from "../Detail";

type Props = {
	items: DuplicateListItem[];
};

export default function ExistingItemList({ items }: Props) {
	return (
		<div className="py-2 flex flex-col items-center">
			<h2 className="text-xl font-bold pb-2 text-center">
				すでに以下の作品が登録済みです。
			</h2>
			<div className="w-full max-w-120 pt-4">
				<ul className="w-full pb-64">
					{items.map((item) => (
						<li key={item.listItemId} className="pb-4">
							<ExistingListItemDetail movie={item} />
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}
