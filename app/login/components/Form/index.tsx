"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Loading from "@/components/Loading";
import { sendLoginCode } from "@/features/auth/actions/sendLoginCode";
import { login } from "@/features/auth/actions/login";
import { syncUserList } from "@/features/list/actions/syncUserList";
import { useListLocalStorageRepository } from "@/features/list/repositories/client/useListLocalStorageRepository";
import Code from "../Flow/Code";
import Email from "../Flow/Email";
import ErrorPanel from "../Flow/Error";

type FormValue = { value: string };
type Status = "idle" | "loading" | "sent" | "error";

export default function LoginForm() {
	const router = useRouter();
	const [status, setStatus] = useState<Status>("idle");

	const [errorType, setErrorType] = useState<
		"send" | "login" | "sync" | undefined
	>(undefined);
	const [errorMessage, setErrorMessage] = useState<string>("");

	const { parseLocalList, clearLocalList } = useListLocalStorageRepository();

	const handleEmailSubmit = async (data: FormValue) => {
		setStatus("loading");

		const result = await sendLoginCode(data.value, new Date());

		setTimeout(() => {
			if (!result.success) {
				setErrorType("send");
				setErrorMessage(result.error.message);

				return setStatus("error");
			}

			return setStatus("sent");
		}, 3000);
	};

	const syncLocalList = async () => {
		const localUserList = parseLocalList();
		const syncResult = await syncUserList({
			localUserListItems: localUserList.items,
		});

		if (!syncResult.success) {
			setErrorType("sync");
			setErrorMessage(syncResult.error.message);

			return setStatus("error");
		}

		clearLocalList();
		return router.push(`/${syncResult.data.publicListId}`);
	};

	const handleLoginCodeSubmit = async (data: FormValue) => {
		setStatus("loading");

		const loginResult = await login(data.value, new Date());

		if (!loginResult.success) {
			setErrorType("login");
			setErrorMessage(loginResult.error.message);

			return setStatus("error");
		}

		const { email, isNewUser } = loginResult.data;

		if (isNewUser) {
			sessionStorage.setItem("registrationEmail", email);
			return router.push("/register");
		}

		return syncLocalList();
	};

	const clearError = () => {
		setErrorType(undefined);
		setErrorMessage("");
	};

	return (
		<div className="h-[calc(100dvh-var(--header-height))] w-dvw flex items-center justify-center">
			<div className="flex flex-col items-center justify-center w-full max-w-150 px-4">
				<div className="w-full h-full flex items-center pb-20">
					<AnimatePresence mode="wait">
						{status === "idle" && (
							<motion.div
								key="idle"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.3 }}
								className="w-full"
							>
								<Email onSubmit={handleEmailSubmit} />
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
								<Code onSubmit={handleLoginCodeSubmit} />
							</motion.div>
						)}

						{status === "error" && errorType === "send" && (
							<motion.div
								key="error"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.3 }}
								className="w-full"
							>
								<ErrorPanel
									title={"ログインコード送信に失敗しました。"}
									message={errorMessage}
									onRetry={() => {
										clearError();
										setStatus("idle");
									}}
								/>
							</motion.div>
						)}

						{status === "error" && errorType === "login" && (
							<motion.div
								key="error"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.3 }}
								className="w-full"
							>
								<ErrorPanel
									title={"ログインに失敗しました。"}
									message={errorMessage}
									onRetry={() => {
										clearError();
										setStatus("idle");
									}}
								/>
							</motion.div>
						)}

						{status === "error" && errorType === "sync" && (
							<motion.div
								key="error"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.3 }}
								className="w-full"
							>
								<ErrorPanel
									title={"リストの同期に失敗しました。"}
									message={errorMessage}
									onRetry={() => {
										clearError();

										setStatus("loading");
										syncLocalList();
									}}
									onSkip={() => router.push("/")}
								/>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</div>
		</div>
	);
}
