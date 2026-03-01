import { Button } from "@/components/ui/button";

type Props = {
	onRetry: () => void;
};

export default function ErrorPanel({ onRetry }: Props) {
	return (
		<div className="w-full flex flex-col gap-4 pb-10">
			<div>
				認証に失敗しました。
				<br />
				メールを確認してやり直してください。
			</div>
			<Button
				type={"button"}
				className="cursor-pointer border-background-light-2 hover:bg-background-light-1 text-foreground-dark-2"
				variant={"outline"}
				onClick={onRetry}
			>
				リトライ
			</Button>
		</div>
	);
}
