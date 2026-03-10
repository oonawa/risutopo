import ArrowCircleRightIcon from "@/components/ui/Icons/ArrowCircleRightIcon";

type Props = {
	url: string;
};

export default function WatchButton({ url }: Props) {
	return (
		<a
			href={url}
			target="_blank"
			rel="noopener"
			className="block w-full transition-colors border border-background-light-1 p-2 rounded-md text-foreground-dark-2 hover:text-foreground hover:bg-background-light-1 hover:border-background-light-2"
		>
			<span className="flex gap-2 items-center justify-center font-bold">
				視聴する
				<ArrowCircleRightIcon className="w-6" />
			</span>
		</a>
	);
}
