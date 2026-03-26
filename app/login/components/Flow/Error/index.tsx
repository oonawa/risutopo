import { Button } from "@/components/ui/button";

type Props = {
	title: string;
	message: string;
	onRetry: () => void;
	onSkip?: () => void;
};

export default function ErrorPanel({ title, message, onRetry, onSkip }: Props) {
	return (
		<div className="w-full flex flex-col gap-10">
			<div className="flex flex-col gap-4">
				<h1 className="text-2xl font-bold underline underline-offset-4 decoration-4 decoration-red-light-2">
					{title}
				</h1>
				{message.split(`\n`).map((text) => (
					<p key={text} className="text-foreground-dark-1">
						{text}
					</p>
				))}
			</div>
			<div className="flex flex-col gap-4">
				<Button
					type={"button"}
					className="cursor-pointer border-background-light-2 hover:bg-background-light-1 text-foreground-dark-2"
					variant={"outline"}
					onClick={onRetry}
				>
					リトライ
				</Button>

				{onSkip && (
					<Button
						type={"button"}
						className="cursor-pointer border-background-light-2 hover:bg-background-light-1 text-foreground-dark-2"
						variant={"outline"}
						onClick={onSkip}
					>
						このまま使う
					</Button>
				)}
			</div>
		</div>
	);
}
