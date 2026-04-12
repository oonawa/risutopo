import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import RegisterForm from "./components/RegisterForm";
import { verifyTempSessionToken } from "@/features/auth/services/session";

export const metadata: Metadata = {
	title: "アカウント登録",
	openGraph: {
		title: "アカウント登録｜りすとぽっと",
	},
};

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
