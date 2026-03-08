type Props = {
	title: string;
	children: React.ReactNode;
};

export default function MovieDetailEmpty({ title, children }: Props) {
	return (
		<div className="w-full h-full p-4 grid place-items-center">
			<div className="flex flex-col items-center gap-4">
				<h2 className="text-xl font-bold text-foreground-dark-1 pt-8">
					{title}
				</h2>
				{children}
			</div>
		</div>
	);
}
