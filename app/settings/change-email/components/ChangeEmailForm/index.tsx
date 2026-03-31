"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { sendCodeToNewEmail } from "@/features/user/actions/sendCodeToNewEmail";
import { changeEmail } from "@/features/user/actions/changeEmail";
import VerifyForm from "@/app/components/auth/VerifyForm";
import Layout from "@/app/components/auth/VerifyForm/Layout";
import EmailInputStep from "@/app/components/auth/VerifyForm/EmailInputStep";

type Props = {
	currentEmail: string;
};

export default function ChangeEmailForm({ currentEmail }: Props) {
	const router = useRouter();
	const pendingEmailRef = useRef("");

	return (
		<Layout title="メールアドレスを変更">
			<VerifyForm
				sendAction={() => sendCodeToNewEmail(pendingEmailRef.current)}
				verifyAction={(code) => changeEmail(pendingEmailRef.current, code)}
				onSuccess={() => router.push("/")}
				initialSlot={({ onSendCode, isPending }) => (
					<EmailInputStep
						onSubmit={(email) => {
							pendingEmailRef.current = email;
							onSendCode();
						}}
						isPending={isPending}
						disallowedValue={currentEmail}
						disallowedMessage="現在と同じメールアドレスです。"
					/>
				)}
				sendErrorTitle="コードの送信に失敗しました。"
				verifyErrorTitle="メールアドレスの変更に失敗しました。"
			/>
		</Layout>
	);
}
