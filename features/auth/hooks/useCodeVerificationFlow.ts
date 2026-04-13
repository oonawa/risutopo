import { useState } from "react";
import type { Result } from "@/features/shared/types/Result";
import { useServerAction } from "@/features/shared/hooks/useServerAction";

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
	const { execute, isPending, networkError, clearNetworkError } =
		useServerAction();
	const [status, setStatus] = useState<
		"initial" | "loading" | "sent" | "error"
	>("initial");
	const [errorPhase, setErrorPhase] = useState<"send" | "verify" | null>(null);
	const [errorMessage, setErrorMessage] = useState("");

	const handleSendCode = () =>
		execute(async () => {
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
		execute(async () => {
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
		clearNetworkError();
		setErrorPhase(null);
		setErrorMessage("");
		setStatus("initial");
	};

	return {
		isPending,
		networkError,
		status,
		errorPhase,
		errorMessage,
		handleSendCode,
		handleVerifyCode,
		reset,
	};
};
