type Props = {
	releaseYear: number;
	title: string;
};

export default function SameDetail({ releaseYear, title }: Props) {
	return (
		<div className="py-4 text-center font-bold">
			{releaseYear}年の『{title}』は
			<br />
			すでにリスト登録されています。
		</div>
	);
}
