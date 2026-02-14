import { Button } from "@/components/ui/button";

type Props = {
	onClick: () => void;
	disabled: boolean;
} & React.ComponentProps<"button">;

export default function FormSubmitButton({
	onClick,
	disabled,
	...props
}: Props) {
	return (
		<div className="w-full flex justify-end pt-10">
			<Button
				type="submit"
				onClick={onClick}
				disabled={disabled}
				variant="outline"
				className="w-full sm:w-fit border-foreground-dark-3 text-foreground-dark-2 hover:bg-background-light-1 cursor-pointer"
				{...props}
			>
				登録
			</Button>
		</div>
	);
}
