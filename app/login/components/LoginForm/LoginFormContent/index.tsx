"use client";

import { redirect } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import LoginInputForm from "./LoginInputForm";
import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";
import { sendLoginCode } from "@/app/login/actions/sendLoginCode";
import { verifyLoginCode } from "@/app/login/actions/verifyLoginCode";

export default function LoginFormContent() {
	type Status = "idle" | "loading" | "sent" | "verifying" | "error";
	const [status, setStatus] = useState<Status>("idle");
	const [errorMessage, setErrorMessage] = useState<string>("");

	const now = new Date();

	const handleEmailSubmit = async (data: { value: string }) => {
		setStatus("loading");
    
		const result = await sendLoginCode(data.value, now);
    
		setTimeout(() => {
			if (result.success) {
				return setStatus("sent");
			}

			setErrorMessage(result.error.message);
			setStatus("idle");
		}, 3000);
	};

	const handleLoginCodeSubmit = async (data: { value: string }) => {
		setStatus("loading");
		const result = await verifyLoginCode(data.value, now);

		if (result.success) {
			const { email, isNewUser } = result.data;
			sessionStorage.setItem("registrationEmail", email);
			return isNewUser ? redirect("/register") : redirect("/");
		}

		setStatus("error");
		setErrorMessage(result.error.message);
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
					<LoginInputForm
						serverErrorMessage={errorMessage}
						placeholder="メールアドレスを入力"
						onSubmit={handleEmailSubmit}
						htmlFor={"email"}
						label={
							<>
								パスワードなしでログインしましょう。
								<br />
								6桁の認証コードをメールでお送りします。
							</>
						}
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
					<LoginInputForm
						placeholder="認証コードを入力"
						onSubmit={handleLoginCodeSubmit}
						htmlFor={"loginCode"}
						label={
							<>
								6桁の認証コードをお送りしました。
								<br />
								メールを確認してください。
							</>
						}
					/>
				</motion.div>
			)}

			{status === "verifying" && (
				<motion.div
					key="verifying"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.3 }}
					className="w-full flex justify-center"
				>
					<Loading />
				</motion.div>
			)}

			{status === "error" && (
				<motion.div
					key="error"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.3 }}
					className="w-full flex flex-col gap-4 pb-10"
				>
					<div>
						認証に失敗しました。
						<br />
						メールを確認してやり直してください。
					</div>
					<Button
						type={"button"}
						className="cursor-pointer border-background-light-2 hover:bg-background-light-1 text-foreground-dark-2"
						variant={"outline"}
						onClick={() => setStatus("idle")}
					>
						リトライ
					</Button>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
