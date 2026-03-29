import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { currentUserId } from "@/features/shared/actions/currentUserId";
import AccountDeleteForm from "./components/AccountDeleteForm";

export default async function AccountDeletePage() {
	const userIdResult = await currentUserId();
	if (!userIdResult.success) {
		redirect("/login");
	}

	const cookieStore = await cookies();
	if (!cookieStore.get("delete_intent_token")) {
		redirect("/");
	}

	return (
		<div className="flex justify-center px-4 pt-16">
			<div className="w-full max-w-150 flex flex-col gap-8">
				<h1 className="text-2xl font-bold underline underline-offset-4 decoration-4 decoration-red-light-2">
					アカウントを削除しますか？
				</h1>
				<AccountDeleteForm />
			</div>
		</div>
	);
}
