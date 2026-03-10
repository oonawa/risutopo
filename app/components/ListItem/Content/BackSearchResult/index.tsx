import { Button } from "@/components/ui/button";
import ArrowCircleLeftIcon from "@/components/ui/Icons/ArrowCircleLeftIcon";

type Props = {
	onClick: () => void;
};

export default function BackSearchResult({ onClick }: Props) {
	return (
		<div className="text-foreground-dark-1">
			<Button
				onClick={onClick}
				className="cursor-pointer flex items-center has-[>svg]:px-0"
			>
				<ArrowCircleLeftIcon />
				もどる
			</Button>
		</div>
	);
}
