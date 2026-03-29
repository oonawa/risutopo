import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import RegisterForm from "./components/RegisterForm";
import { verifyTempSessionToken } from "@/features/auth/services/session";

export default async function RegisterPage() {
	const cookieStore = await cookies();
	const tempToken = cookieStore.get("temp_session_token")?.value;

	const tempSession = await verifyTempSessionToken({
		tempToken,
		now: new Date(),
	});

	if (!tempSession || !tempToken) {
		return redirect("/");
	}

	return <RegisterForm token={tempToken} email={tempSession.email} />;
}
