"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type z from "zod";
import { loginCodeSchema } from "@/features/auth/schemas/loginSchemas";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type FormData = z.infer<typeof loginCodeSchema>;

type Props = {
	onSubmit: (code: string) => void;
	disabled?: boolean;
};

export default function CodeInput({ onSubmit, disabled }: Props) {
	const {
		register,
		handleSubmit,
		formState: { errors },
		watch,
	} = useForm<FormData>({
		resolver: zodResolver(loginCodeSchema),
		mode: "onSubmit",
	});

	const value = watch("value");

	return (
		<form
			className="w-full flex flex-col gap-4"
			onSubmit={handleSubmit((data) => onSubmit(data.value))}
		>
			<label htmlFor="loginCode">
				6桁の認証コードをお送りしました。
				<br />
				メールを確認してください。
			</label>
			<Input
				className="border-background-light-2 focus-visible:ring-2 focus-visible:ring-background-light-2 px-2 transition-shadow duration-300"
				placeholder="認証コードを入力"
				type="text"
				id="loginCode"
				{...register("value")}
			/>
			{errors.value && (
				<p className="text-sm text-red-500">{errors.value.message}</p>
			)}
			<Button
				type="submit"
				disabled={!value || !!disabled}
				className="cursor-pointer border-background-light-2 hover:bg-background-light-1 text-foreground-dark-2"
				variant="outline"
			>
				確認
			</Button>
		</form>
	);
}
