import { redirect } from "next/navigation";
import { isAuthenticated } from "@/features/auth/services/session";
import Login from "./components/Login";

export default async function LoginPage() {
	const authenticated = await isAuthenticated();

	if (authenticated) {
		redirect("/");
	}

	return <Login />;
}
