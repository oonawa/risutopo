import { currentUserPublicListId } from "@/features/shared/actions/currentUserPublicListId";
import MenuContent from "./Content";

export default async function Menu() {
	const publicListIdResult = await currentUserPublicListId();
	const publicListId = publicListIdResult.success
		? publicListIdResult.data.publicListId
		: null;

	return <MenuContent publicListId={publicListId} />;
}
