import { redirect } from "next/navigation";
import { currentUserId } from "@/features/shared/actions/currentUserId";
import VerifyForm from "../../components/VerifyForm";

export default async function AccountDeleteVerifyPage() {
	const userIdResult = await currentUserId();
	if (!userIdResult.success) {
		redirect("/");
	}

	return <VerifyForm purpose="delete_account" />;
}
