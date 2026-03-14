import { Resend } from "resend";
import LoginMailTemplate from "../components/LoginMailTemplate";

export async function sendLoginMail({
	email,
	loginCode,
	url,
}: {
	email: string;
	loginCode: string;
	url: string;
}) {
	const resend = new Resend(process.env.RESEND_API_KEY);

	return await resend.emails.send({
		from:
			process.env.NODE_ENV === "development"
				? "onboarding@resend.dev"
				: "りすとぽっと <hi@risutopo.com>",
		to: email,
		subject: "【りすとぽっと】ログインコードをお送りします",
		react: LoginMailTemplate({ loginCode, url }),
	});
}
