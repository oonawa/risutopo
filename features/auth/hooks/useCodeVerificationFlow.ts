import type { Result } from "@/features/shared/types/Result";
import { useState, useTransition } from "react";

type Options = {
	sendAction: () => Promise<Result>;
	verifyAction: (code: string) => Promise<Result>;
	onSuccess: () => void | Promise<void>;
};

export const useCodeVerificationFlow = ({
	sendAction,
	verifyAction,
	onSuccess,
}: Options) => {
	const [isPending, startTransition] = useTransition();
	const [status, setStatus] = useState<
		"initial" | "loading" | "sent" | "error"
	>("initial");
	const [errorPhase, setErrorPhase] = useState<"send" | "verify" | null>(null);
	const [errorMessage, setErrorMessage] = useState("");

	const handleSendCode = () =>
		startTransition(async () => {
			setStatus("loading");
			const result = await sendAction();
			if (!result.success) {
				setErrorPhase("send");
				setErrorMessage(result.error.message);
				return setStatus("error");
			}
			setStatus("sent");
		});

	const handleVerifyCode = (code: string) =>
		startTransition(async () => {
			setStatus("loading");
			const result = await verifyAction(code);
			if (!result.success) {
				setErrorPhase("verify");
				setErrorMessage(result.error.message);
				return setStatus("error");
			}
			await onSuccess();
		});

	const reset = () => {
		setErrorPhase(null);
		setErrorMessage("");
		setStatus("initial");
	};

	return {
		isPending,
		status,
		errorPhase,
		errorMessage,
		handleSendCode,
		handleVerifyCode,
		reset,
	};
};
