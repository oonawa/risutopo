import { redirect } from "next/navigation";
import FormContainer from "@/components/FormContainer";
import RegstarForm from "./components/RegisterForm";
import { verifyTempSessionToken } from "@/lib/auth";

export default async function RegstarPage() {
	const tempSession = await verifyTempSessionToken();

	if (!tempSession) {
		return redirect("/");
	}

	return (
		<FormContainer>
			<RegstarForm email={tempSession.email} />
		</FormContainer>
	);
}
