import { redirect } from "next/navigation";
import { currentUserId } from "@/features/shared/actions/currentUserId";
import { currentUserEmail } from "@/features/shared/actions/currentUserEmail";
import VerifyForm from "./components/VerifyForm";

export default async function AccountDeleteVerifyPage() {
	const userIdResult = await currentUserId();
	if (!userIdResult.success) {
		redirect("/login");
	}

	const emailResult = await currentUserEmail();
	if (!emailResult.success) {
		redirect("/");
	}

	return <VerifyForm email={emailResult.data.email} />;
}
