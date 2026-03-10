type Props = {
	title: string;
	children: React.ReactNode;
};

export default function Section({ title, children }: Props) {
	return (
		<section className="max-w-2xl mx-auto px-4 pt-6">
			<div className="border border-background-light-1 rounded-2xl px-4 py-5 md:p-8">
				<h2 className="leading-4 text-lg md:text-xl font-bold">{title}</h2>
				<div className="pt-4">{children}</div>
			</div>
		</section>
	);
}
