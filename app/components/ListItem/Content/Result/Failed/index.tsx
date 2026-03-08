type Props = {
	errorMessage?: string;
};

export default function StoreFailed({ errorMessage }: Props) {
	return (
		<div className="border border-background-light-1 rounded-md py-4 px-2 text-center">
			<div className="text-xl font-bold underline underline-offset-4 decoration-red-light-2 decoration-2">
				保存に失敗しました
			</div>
			{errorMessage && (
				<p className="pt-2 text-sm text-foreground-dark-2">{errorMessage}</p>
			)}
		</div>
	);
}
