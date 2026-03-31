"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import Loading from "@/components/Loading";
import { useCodeVerificationFlow } from "@/features/auth/hooks/useCodeVerificationFlow";
import type { Result } from "@/features/shared/types/Result";
import CodeInput from "./CodeInput";
import ErrorPanel from "./ErrorPanel";

const motionProps = {
	initial: { opacity: 0 },
	animate: { opacity: 1 },
	exit: { opacity: 0 },
	transition: { duration: 0.3 },
} as const;

type Props = {
	sendAction: () => Promise<Result>;
	verifyAction: (code: string) => Promise<Result>;
	onSuccess: () => void | Promise<void>;
	initialSlot: (props: { onSendCode: () => void; isPending: boolean }) => ReactNode;
	sendErrorTitle?: string;
	verifyErrorTitle?: string;
};

export default function VerifyForm({
	sendAction,
	verifyAction,
	onSuccess,
	initialSlot,
	sendErrorTitle = "エラーが発生しました。",
	verifyErrorTitle = "エラーが発生しました。",
}: Props) {
	const { isPending, status, errorPhase, errorMessage, handleSendCode, handleVerifyCode, reset } =
		useCodeVerificationFlow({ sendAction, verifyAction, onSuccess });

	const errorTitle = errorPhase === "send" ? sendErrorTitle : verifyErrorTitle;

	return (
		<AnimatePresence mode="wait">
			{status === "initial" && (
				<motion.div key="initial" {...motionProps} className="w-full">
					{initialSlot({ onSendCode: handleSendCode, isPending })}
				</motion.div>
			)}

			{status === "loading" && (
				<motion.div key="loading" {...motionProps} className="w-full flex justify-center">
					<Loading />
				</motion.div>
			)}

			{status === "sent" && (
				<motion.div key="sent" {...motionProps} className="w-full">
					<CodeInput onSubmit={handleVerifyCode} disabled={isPending} />
				</motion.div>
			)}

			{status === "error" && (
				<motion.div key="error" {...motionProps} className="w-full">
					<ErrorPanel title={errorTitle} message={errorMessage} onRetry={reset} />
				</motion.div>
			)}
		</AnimatePresence>
	);
}
