import DrawerMenuContent from "./Content";
import { currentUserEmail } from "@/features/shared/actions/currentUserEmail";

export default async function DrawerMenu() {
	const result = await currentUserEmail();

	return (
		<DrawerMenuContent email={result.success ? result.data.email : null} />
	);
}
