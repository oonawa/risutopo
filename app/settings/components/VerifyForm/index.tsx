"use client";

import { useRouter } from "next/navigation";
import { sendCurrentUserLoginCode } from "@/features/auth/actions/sendCurrentUserLoginCode";
import { issueReauthToken } from "@/features/auth/actions/issueReauthToken";
import VerifyForm from "@/app/components/auth/VerifyForm";
import Layout from "@/app/components/auth/VerifyForm/Layout";
import { Button } from "@/components/ui/button";

const PURPOSE_PATHS = {
	delete_account: "/settings/account-delete",
	change_email: "/settings/change-email",
} as const;

type Props = {
	purpose: "delete_account" | "change_email";
};

export default function ReauthVerifyForm({ purpose }: Props) {
	const router = useRouter();

	return (
		<Layout>
			<VerifyForm
				sendAction={sendCurrentUserLoginCode}
				verifyAction={(code) => issueReauthToken(code, purpose)}
				onSuccess={() => router.push(PURPOSE_PATHS[purpose])}
				initialSlot={({ onSendCode, isPending }) => (
					<div className="w-full flex flex-col gap-8">
						<p className="text-foreground-dark-1">
							この操作を行うには、安全のため再度ログインしてください。
						</p>
						<Button
							onClick={onSendCode}
							disabled={isPending}
							variant="outline"
							className="cursor-pointer border-background-light-2 hover:bg-background-light-1 text-foreground-dark-2"
						>
							再ログイン
						</Button>
					</div>
				)}
				sendErrorTitle="コードの送信に失敗しました。"
				verifyErrorTitle="再ログインに失敗しました。"
			/>
		</Layout>
	);
}
