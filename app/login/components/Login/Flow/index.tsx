"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Loading from "@/components/Loading";
import { sendLoginCode } from "@/features/auth/actions/sendLoginCode";
import { login } from "@/features/auth/actions/login";
import { syncUserList } from "@/features/list/actions/syncUserList";
import { useListLocalStorageRepository } from "@/features/list/repositories/client/useListLocalStorageRepository";
import CodeStep from "./CodeStep";
import EmailStep from "./EmailStep";
import ErrorPanel from "./ErrorPanel";

type FormValue = { value: string };
type Status = "idle" | "loading" | "sent" | "error";

export default function Flow() {
	const router = useRouter();
	const [status, setStatus] = useState<Status>("idle");
	const [errorMessage, setErrorMessage] = useState<string>("");

	const { parseLocalList, clearLocalList } = useListLocalStorageRepository();

	const handleEmailSubmit = async (data: FormValue) => {
		setStatus("loading");

		const result = await sendLoginCode(data.value, new Date());

		setTimeout(() => {
			if (result.success) {
				return setStatus("sent");
			}

			setErrorMessage(result.error.message);
			setStatus("idle");
		}, 3000);
	};

	const handleLoginCodeSubmit = async (data: FormValue) => {
		setStatus("loading");
		const loginResult = await login(data.value, new Date());

		if (!loginResult.success) {
			setStatus("error");
			setErrorMessage(loginResult.error.message);

			return;
		}

		const { email, isNewUser } = loginResult.data;

		if (isNewUser) {
			sessionStorage.setItem("registrationEmail", email);
			return router.push("/register");
		}

		const localUserList = parseLocalList();
		const result = await syncUserList({
			localUserListItems: localUserList.items,
		});

		if (result.success) {
			clearLocalList();
			return router.push(`/${result.data.publicListId}`);
		}

		return router.push(`/${localUserList.listId}`);
	};

	return (
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
					<EmailStep
						serverErrorMessage={errorMessage}
						onSubmit={handleEmailSubmit}
					/>
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
					<CodeStep onSubmit={handleLoginCodeSubmit} />
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
					<ErrorPanel onRetry={() => setStatus("idle")} />
				</motion.div>
			)}
		</AnimatePresence>
	);
}
