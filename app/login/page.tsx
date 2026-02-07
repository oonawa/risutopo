import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import LoginForm from "./components/LoginForm";

export default async function LoginPage() {
	const authenticated = await isAuthenticated();

	if (authenticated) {
		redirect("/");
	}

	return <LoginForm />;
}
