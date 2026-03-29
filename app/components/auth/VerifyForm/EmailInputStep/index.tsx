"use client";

import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type z from "zod";
import { emailSchema } from "@/features/auth/schemas/loginSchemas";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type FormData = z.infer<typeof emailSchema>;

type Props = {
	onSubmit: (email: string) => void;
	isPending: boolean;
	label?: ReactNode;
	disallowedValue?: string;
	disallowedMessage?: string;
};

export default function EmailInputStep({
	onSubmit,
	isPending,
	label,
	disallowedValue,
	disallowedMessage = "このメールアドレスは使用できません。",
}: Props) {
	const {
		register,
		handleSubmit,
		formState: { errors },
		watch,
	} = useForm<FormData>({
		resolver: zodResolver(emailSchema),
		mode: "onSubmit",
	});

	const value = watch("value");
	const isDisallowed = !!disallowedValue && value === disallowedValue;

	return (
		<form
			className="w-full flex flex-col gap-4"
			onSubmit={handleSubmit((data) => onSubmit(data.value))}
		>
			{label && <label htmlFor="email">{label}</label>}
			<Input
				className="border-background-light-2 focus-visible:ring-2 focus-visible:ring-background-light-2 px-2 transition-shadow duration-300"
				placeholder="メールアドレスを入力"
				type="text"
				id="email"
				{...register("value")}
			/>
			{errors.value && (
				<p className="text-sm text-red-500">{errors.value.message}</p>
			)}
			{!errors.value && isDisallowed && (
				<p className="text-sm text-red-500">{disallowedMessage}</p>
			)}
			<Button
				type="submit"
				disabled={!value || isPending || isDisallowed}
				className="cursor-pointer border-background-light-2 hover:bg-background-light-1 text-foreground-dark-2"
				variant="outline"
			>
				送信
			</Button>
		</form>
	);
}
