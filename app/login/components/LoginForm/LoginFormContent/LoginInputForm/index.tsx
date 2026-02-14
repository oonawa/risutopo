"use client";

import type z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { emailSchema, loginCodeSchema } from "@/app/login/loginSchemas";

type EmailFormData = z.infer<typeof emailSchema>;
type LoginCodeFormData = z.infer<typeof loginCodeSchema>;

type Props = {
	label: React.ReactNode;
	htmlFor: "email" | "loginCode";
	placeholder: string;
	onSubmit: (data: EmailFormData | LoginCodeFormData) => void;
	serverErrorMessage?: string;
};

export default function LoginInputForm({
	label,
	htmlFor,
	placeholder,
	onSubmit,
	serverErrorMessage,
}: Props) {
	const schema = htmlFor === "email" ? emailSchema : loginCodeSchema;
	const {
		register,
		handleSubmit,
		formState: { errors },
		watch,
	} = useForm<EmailFormData | LoginCodeFormData>({
		resolver: zodResolver(schema),
		mode: "onSubmit",
	});

	const value = watch("value");

	return (
		<form
			className="w-full flex flex-col gap-4 pb-10"
			onSubmit={handleSubmit(onSubmit)}
		>
			<label htmlFor={htmlFor}>{label}</label>
			<Input
				className="border-background-light-2 focus-visible:ring-2 focus-visible:ring-background-light-2 px-2 transition-shadow duration-300"
				placeholder={placeholder}
				type="text"
				id={htmlFor}
				{...register("value")}
			/>

			{serverErrorMessage && (
				<p className="text-sm text-red-500">{serverErrorMessage}</p>
			)}
			{errors.value && (
				<p className="text-sm text-red-500">{errors.value.message}</p>
			)}

			<Button
				type="submit"
				disabled={!value}
				className="cursor-pointer border-background-light-2 hover:bg-background-light-1 text-foreground-dark-2"
				variant={"outline"}
			>
				{htmlFor === "email" ? "送信" : "ログイン"}
			</Button>
		</form>
	);
}
