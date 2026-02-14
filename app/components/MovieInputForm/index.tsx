"use client";

import { useCallback, useState } from "react";
import { AnimatePresence } from "motion/react";
import type { MovieInfo } from "@/app/types/MovieInputForm/MovieInfo";
import { useActiveTab } from "@/app/hooks/useActiveTab";
import { useMovieForm } from "@/app/hooks/useMovieForm";
import type { MovieInputValues } from "@/app/types/MovieInputForm/MovieInputValues";
import { useFormStatus } from "@/app/hooks/useFormStatus";
import WebBrowserIcon from "@/components/ui/Icons/WebBrowserIcon";
import MobileDeviceIcon from "@/components/ui/Icons/MobileDeviceIcon";
import Loading from "@/components/Loading";
import Tab from "./Tab";
import PcForm from "./PcForm";
import MobileForm from "./MobileForm";
import TransitionContainer from "./TransitionContainer";
import Success from "./Result/Success";
import Failed from "./Result/Failed";
import type { MovieFormError } from "@/app/types/MovieInputForm/MovieFormError";

type Props = {
	initialIsMobile: boolean;
	userAgent: string;
	listId: number | null;
};

type SharedHandlerInput = {
	isValid: boolean;
};

type MobileSubmitInput = {
	shareLink: string;
} & SharedHandlerInput;

type PcChangeInput = {
	values: { title: string; url: string };
} & SharedHandlerInput;

type HandleBuildValues<TInput> = (input: TInput) => MovieInputValues;

export default function MovieInputForm({
	initialIsMobile,
	userAgent,
	listId,
}: Props) {
	const [registeredMovie, setRegisteredMovie] = useState<MovieInfo>();
	const [failedInput, setFailedInput] = useState<MovieInputValues>();
	const [errorMessage, setErrorMessage] = useState<MovieFormError>();

	const { activeTab, setActiveTab } = useActiveTab({
		initialIsMobile,
		userAgent,
	});

	const debounceMs = 300;

	const { storageErrorMessage, handleValueChange } = useMovieForm({
		listId,
		debounceMs,
	});

	const { status, initStatus, transitionFormStatus } = useFormStatus(500);

	const handleSubmit = useCallback(
		async <TInput,>(
			isValid: boolean,
			input: TInput,
			buildValues: HandleBuildValues<TInput>,
		) => {
			if (!isValid) {
				return;
			}

			const values = buildValues(input);
			const result = await handleValueChange({
				values,
			});

			if (result === null) {
				return;
			}

			if (result.success) {
				setRegisteredMovie(result.data);
			} else {
				setErrorMessage(result.error);
				setFailedInput(values);
			}
			transitionFormStatus(result.success);
		},
		[handleValueChange, transitionFormStatus],
	);

	const handleMobileSubmit = useCallback(
		async ({ shareLink, isValid }: MobileSubmitInput) => {
			transitionFormStatus();

			return await handleSubmit(
				isValid,
				{ shareLink },
				({ shareLink: link }) => ({
					mobile: { shareLink: link },
				}),
			);
		},
		[handleSubmit, transitionFormStatus],
	);

	const handlePcChange = useCallback(
		async ({ values, isValid }: PcChangeInput) => {
			transitionFormStatus();

			return await handleSubmit(isValid, values, (browserValues) => ({
				browser: browserValues,
			}));
		},
		[handleSubmit, transitionFormStatus],
	);

	return (
		<div className="flex flex-col items-center justify-center md:p-4 w-[90dvw] md:w-[60dvw] max-w-150 h-full max-h-[70dvh]">
			<div className="w-full h-full flex items-center">
				<AnimatePresence mode="wait">
					{status === "idle" ? (
						<TransitionContainer className="w-full pt-10" key="idle">
							{activeTab === "pc" ? (
								<PcForm
									onSubmit={handlePcChange}
									storageErrorMessage={storageErrorMessage}
								/>
							) : (
								<MobileForm
									onSubmit={handleMobileSubmit}
									storageErrorMessage={storageErrorMessage}
								/>
							)}

							<div className="flex justify-center pt-20">
								<div className="max-w-[50dvw] grid grid-cols-2 gap-2 border border-background-light-1 rounded-full p-1 bg-background">
									<Tab
										onClick={() => setActiveTab("pc")}
										isActive={activeTab === "pc"}
									>
										<WebBrowserIcon className="size-5" />
									</Tab>
									<Tab
										onClick={() => setActiveTab("mobile")}
										isActive={activeTab === "mobile"}
									>
										<MobileDeviceIcon className="size-5" />
									</Tab>
								</div>
							</div>
						</TransitionContainer>
					) : status === "sending" ? (
						<TransitionContainer
							className="w-full flex justify-center"
							key="sending"
						>
							<Loading />
						</TransitionContainer>
					) : status === "success" && registeredMovie ? (
						<TransitionContainer className="w-full" key="success">
							<Success movie={registeredMovie} onClick={initStatus} />
						</TransitionContainer>
					) : status === "failed" && failedInput ? (
						<TransitionContainer className="w-full" key="failed">
							{errorMessage && (
								<Failed
									onClick={initStatus}
									error={errorMessage}
									inputValues={failedInput}
								/>
							)}
						</TransitionContainer>
					) : (
						<TransitionContainer key="failed-fallback">
							失敗しました。もう一度お試しください。
						</TransitionContainer>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}
