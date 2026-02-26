import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import FormContainer from "@/components/FormContainer";
import RegisterForm from "./components/RegisterForm";
import { verifyTempSessionToken } from "@/lib/auth";

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

	return (
		<FormContainer>
			<RegisterForm token={tempToken} email={tempSession.email} />
		</FormContainer>
	);
}
