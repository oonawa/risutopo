import { currentUserPublicListId } from "@/features/shared/actions/currentUserPublicListId";
import { getRouletteListItemIds } from "@/features/list/actions/getRouletteListItemIds";
import { getSubLists } from "@/features/list/actions/getSubLists";
import RouletteContent from "./Content";

export default async function Roulette() {
	const publicListIdResult = await currentUserPublicListId();
	const publicListId = publicListIdResult.success
		? publicListIdResult.data.publicListId
		: null;

	const listItemIds = publicListId
		? await getRouletteListItemIds(publicListId).then((r) =>
				r.success ? r.data : undefined,
			)
		: undefined;

	const subLists = publicListId
		? await getSubLists().then((r) => (r.success ? r.data : undefined))
		: undefined;

	return <RouletteContent listItemIds={listItemIds} subLists={subLists} />;
}
