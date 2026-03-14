import { redirect } from "next/navigation";
import { currentUserId } from "@/features/shared/actions/currentUserId";
import Login from "./components/Login";

export default async function LoginPage() {
	const result = await currentUserId();

	if (result.success) {
		redirect("/");
	}

	return <Login />;
}
