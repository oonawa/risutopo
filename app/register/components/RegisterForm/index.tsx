"use client";

import type z from "zod";
import { redirect } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { userIdSchema } from "@/app/register/userIdSchema";
import { searchDeplicateUserId } from "@/app/register/actions/serchDuplicateUserId";
import { registerUser } from "../../actions/registerUser";

type UserIdFormData = z.infer<typeof userIdSchema>;

type Props = {
	email: string;
};

export default function RegstarForm({ email }: Props) {
	const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
	const [isDuplicate, setIsDuplicate] = useState(false);
	const [serverErrorMessage, setServerErrorMessage] = useState<string>("");

	const {
		register,
		handleSubmit,
		formState: { errors },
		watch,
	} = useForm<UserIdFormData>({
		resolver: zodResolver(userIdSchema),
		mode: "onChange",
	});

	const value = watch("userId");
	const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

	const onInput = useCallback(async (inputValue: string) => {
		const result = userIdSchema.safeParse({ userId: inputValue });
		if (result.error?.message) {
			setIsDuplicate(false);
			return;
		}

		setIsCheckingDuplicate(true);

		const count = await searchDeplicateUserId(inputValue);
		setIsDuplicate(count > 0);

		setIsCheckingDuplicate(false);
	}, []);

	const handleInput = useCallback(
		(e: React.FormEvent<HTMLInputElement>) => {
			const inputValue = e.currentTarget.value;

			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current);
			}

			debounceTimerRef.current = setTimeout(() => {
				onInput(inputValue);
			}, 400);
		},
		[onInput],
	);

	useEffect(() => {
		return () => {
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current);
			}
		};
	}, []);

	const onSubmit = async (data: UserIdFormData) => {
		const result = await registerUser({ userId: data.userId, email });
		if (result.success) {
			return redirect("/");
		}

		setServerErrorMessage(result.error.message);
	};

	return (
		<form
			className="w-full flex flex-col gap-4 pb-10"
			onSubmit={handleSubmit(onSubmit)}
		>
			<label htmlFor={"userId"}>ユーザーIDを入力</label>
			<div className="flex flex-col gap-1">
				<Input
					className="border-background-light-2 focus-visible:ring-2 focus-visible:ring-background-light-2 px-2 transition-shadow duration-300"
					placeholder="理想の名前を考えましょう。"
					type="text"
					id="userId"
					{...register("userId")}
					onInput={handleInput}
				/>
				<div className="flex items-center text-xs text-foreground-dark-3 pl-1">
					3〜20文字以内・半角の英字・数字・アンダースコア（
					<span className="px-1 py-0.5 text-xs bg-background-light-1 rounded-xs">
						_
					</span>
					）が使えます
				</div>
				{isCheckingDuplicate && (
					<p className="text-sm text-blue-500">確認中...</p>
				)}
				{!isCheckingDuplicate && isDuplicate && (
					<p className="text-sm text-red-500">
						このユーザーIDは既に使用されています
					</p>
				)}
				{!isCheckingDuplicate && !isDuplicate && value && !errors.userId && (
					<p className="text-sm text-green-500">このユーザーIDは利用可能です</p>
				)}
				{serverErrorMessage && (
					<p className="text-sm text-green-500">{serverErrorMessage}</p>
				)}
			</div>

			<Button
				type="submit"
				disabled={!value}
				className="cursor-pointer border-background-light-2 hover:bg-background-light-1 text-foreground-dark-2"
				variant={"outline"}
			>
				登録
			</Button>
		</form>
	);
}
