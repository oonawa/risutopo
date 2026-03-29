"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import Loading from "@/components/Loading";
import { sendLoginCode } from "@/features/auth/actions/sendLoginCode";
import { issueDeleteIntentToken } from "@/features/auth/actions/issueDeleteIntentToken";
import Code from "@/app/login/components/Flow/Code";
import ErrorPanel from "@/app/login/components/Flow/Error";
import { Button } from "@/components/ui/button";

type Status = "pre" | "loading" | "sent" | "error";

type FormValue = { value: string };

type Props = {
	email: string;
};

export default function VerifyForm({ email }: Props) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [status, setStatus] = useState<Status>("pre");
	const [errorMessage, setErrorMessage] = useState<string>("");

	const handleSendCode = () => {
		startTransition(async () => {
			setStatus("loading");
			const result = await sendLoginCode(email, new Date());
			if (!result.success) {
				setErrorMessage(result.error.message);
				return setStatus("error");
			}
			setStatus("sent");
		});
	};

	const handleCodeSubmit = (data: FormValue) => {
		startTransition(async () => {
			setStatus("loading");
			const result = await issueDeleteIntentToken(data.value);
			if (!result.success) {
				setErrorMessage(result.error.message);
				return setStatus("error");
			}
			router.push("/account-delete");
		});
	};

	return (
		<div className="h-[calc(100dvh-var(--header-height))] w-dvw flex items-center justify-center">
			<div className="flex flex-col items-center justify-center w-full max-w-150 px-4">
				<div className="w-full h-full flex items-center pb-20">
					<AnimatePresence mode="wait">
						{status === "pre" && (
							<motion.div
								key="pre"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.3 }}
								className="w-full flex flex-col gap-8"
							>
								<p className="text-foreground-dark-1">
									アカウントを削除するには、安全のため再度ログインしてください。
								</p>
								<Button
									onClick={handleSendCode}
									disabled={isPending}
									variant={"outline"}
									className="cursor-pointer border-background-light-2 hover:bg-background-light-1 text-foreground-dark-2"
								>
									再ログイン
								</Button>
							</motion.div>
						)}

						{status === "loading" && (
							<motion.div
								key="loading"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.3 }}
								className="w-full flex justify-center"
							>
								<Loading />
							</motion.div>
						)}

						{status === "sent" && (
							<motion.div
								key="sent"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.3 }}
								className="w-full"
							>
								<Code onSubmit={handleCodeSubmit} />
							</motion.div>
						)}

						{status === "error" && (
							<motion.div
								key="error"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.3 }}
								className="w-full"
							>
								<ErrorPanel
									title={"エラーが発生しました。"}
									message={errorMessage}
									onRetry={() => {
										setErrorMessage("");
										setStatus("pre");
									}}
								/>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</div>
		</div>
	);
}
