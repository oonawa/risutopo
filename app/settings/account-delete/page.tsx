import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { currentUserId } from "@/features/shared/actions/currentUserId";
import AccountDeleteForm from "./components/AccountDeleteForm";

export default async function AccountDeletePage() {
	const userIdResult = await currentUserId();
	if (!userIdResult.success) {
		redirect("/");
	}

	const cookieStore = await cookies();
	if (!cookieStore.get("delete_account_reauth_token")) {
		redirect("/");
	}

	return <AccountDeleteForm />;
}
