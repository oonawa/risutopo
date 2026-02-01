import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { Textarea } from "../ui/textarea";

export default function Form({
	className,
	...props
}: ComponentProps<"textarea">) {
	return (
		<Textarea
			className={cn("border-background-light-2 focus-visible:ring-2 focus-visible:ring-background-light-2 px-2 transition-shadow duration-300", className)}
			{...props}
		/>
	);
}
