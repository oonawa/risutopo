"use client";

import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { Textarea } from "../../ui/textarea";

type Props = ComponentProps<"textarea"> & {
	onPaste?: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
};

export default function Form({ className, onPaste, ...props }: Props) {
	return (
		<Textarea
			className={cn(
				"border-background-light-2 focus-visible:ring-2 focus-visible:ring-background-light-2 px-2 transition-shadow duration-300",
				className,
			)}
			onPaste={onPaste}
			{...props}
		/>
	);
}
