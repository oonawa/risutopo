type Props = {
	children: React.ReactNode;
};

export default function Section({ children }: Props) {
	return (
		<section className="max-w-2xl mx-auto px-4 pb-8 pt-14 md:pb-12 md:pt-18">
			{children}
		</section>
	);
}
