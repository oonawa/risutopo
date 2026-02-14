import { useCallback, useState } from "react";

export function useFormStatus(ms: number) {
	const [status, setStatus] = useState<
		"idle" | "sending" | "success" | "failed"
	>("idle");

	const waiting = useCallback(async (ms: number) => {
		return new Promise<void>((resolve) => {
			setTimeout(() => {
				resolve();
			}, ms);
		});
	}, []);

	const initStatus = () => {
		return setStatus("idle");
	};

	const setFailedStatus = () => {
		return waiting(ms).then(() => {
			setStatus("failed");

			return waiting(ms).then(() => {
				initStatus();
			});
		});
	};

	const setResultStatus = async () => {
		return waiting(ms).then(() => {
			setStatus("success");
		});
	};

	const setSendingStatus = () => {
		setStatus("sending");
	};

	const transitionFormStatus = async (isSuccess?: boolean) => {
		if (isSuccess !== undefined) {
			return isSuccess ? setResultStatus() : setFailedStatus();
		}

		return setSendingStatus();
	};

	return {
		status,
		initStatus,
		transitionFormStatus,
	};
}
