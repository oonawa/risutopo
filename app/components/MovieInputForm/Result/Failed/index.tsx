import { Button } from "@/components/ui/button";
import type { MovieInputValues } from "@/app/types/MovieInputForm/MovieInputValues";
import type { MovieFormError } from "@/app/types/MovieInputForm/MovieFormError";
import type { ZodError } from "zod";
import InputValue from "./InputValue";

type Props = {
	onClick: () => void;
	error: MovieFormError;
	inputValues: MovieInputValues;
};

type FieldError = {
	key: string;
	message: string;
};

function isZodError(error: MovieFormError): error is ZodError {
	return "issues" in error;
}

function findIssueMessage(error: ZodError, field: string): string | null {
	const issue = error.issues.find((item) => item.path[0] === field);
	return issue?.message ?? null;
}

function buildFieldErrors(
	error: MovieFormError,
	inputValues: MovieInputValues,
) {
	if (!isZodError(error)) {
		return;
	}

	if (inputValues.mobile) {
		const inputKey = Object.keys(inputValues.mobile)[0];
		const message = error.issues[0]?.message ?? error.message;
		return [{ key: inputKey, message }];
	}

	const fieldErrors: FieldError[] = [];

	for (const inputKey in inputValues.browser) {
		const message = findIssueMessage(error, inputKey);
		if (!message) {
			continue;
		}
		fieldErrors.push({ key: inputKey, message });
	}

	if (fieldErrors.length > 0) {
		return fieldErrors;
	}
}

export default function Failed({ onClick, error, inputValues }: Props) {
	const fieldErrors = buildFieldErrors(error, inputValues);

	const isErrorField = (field: string) =>
		fieldErrors?.find((error) => error.key === field) !== undefined;

	return (
		<div className="w-full h-dvh flex justify-center items-center px-2">
			<div className="w-full max-w-125 px-4 pt-20 pb-18 bg-background-dark-1 rounded-md">
				<span className="pb-2 w-full flex justify-center">
					<h2 className="text-xl font-bold text-foreground-dark-2">
						リスト登録に失敗しました
					</h2>
				</span>

				<div className="mt-6 px-4 py-6 border border-background-light-2 rounded-md">
					<div className="flex flex-col items-center">
						{inputValues.mobile ? (
							<InputValue
								label="共有リンク"
								value={inputValues.mobile.shareLink}
								isError={isErrorField("shareLink")}
							/>
						) : (
							<>
								<InputValue
									label="タイトル"
									value={inputValues.browser.title}
									isError={isErrorField("title")}
								/>
								<InputValue
									label="URL"
									value={inputValues.browser.url}
									isError={isErrorField("url")}
								/>
							</>
						)}
					</div>
					<div className="px-4 pt-4 pb-2 flex flex-col gap-2">
						{fieldErrors ? (
							fieldErrors.map((fieldError) => (
								<p
									key={fieldError.key}
									className="text-center text-foreground-dark-2 font-bold"
								>
									{fieldError.message}
								</p>
							))
						) : (
							<p className="text-center text-foreground-dark-2 font-bold">
								{error.message}
							</p>
						)}
					</div>
				</div>

				<div className="w-full flex justify-center pt-10">
					<Button
						onClick={onClick}
						type="button"
						variant={"outline"}
						className="text-foreground-dark-3 rounded-md cursor-pointer bg-background-dark-1 border-foreground-dark-3 text-xs"
					>
						やりなおす
					</Button>
				</div>
			</div>
		</div>
	);
}
