"use client";

import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

type Props = ComponentProps<"textarea">;

export default function FormTextarea({ className, ...props }: Props) {
	return (
		<Textarea
			className={cn(
				"border-foreground-dark-3 focus-visible:ring-2 focus-visible:ring-foreground-dark-3 px-2 transition-shadow duration-300",
				className,
			)}
			{...props}
		/>
	);
}
