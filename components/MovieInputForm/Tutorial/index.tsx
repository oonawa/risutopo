import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogDescription,
} from "@/components/ui/dialog";
import Question from "@/components/ui/Icons/Question";

type Props = {
	title: string;
	children: React.ReactNode;
};

export default function Tutorial({ title, children }: Props) {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<div className="w-full pt-2 text-background-light-2">
					<div className="cursor-pointer w-fit flex justify-start items-center gap-1">
						<Question className="size-5" />
						<span className="text-xs">何をすればいい？</span>
					</div>
				</div>
			</DialogTrigger>
			<DialogContent className="sm:max-w-xl border-background-light-2 p-4 md:p-6">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>
				{children}
				<DialogDescription className="text-center">
					取得したら、そのまま貼り付けてください。
				</DialogDescription>
			</DialogContent>
		</Dialog>
	);
}
