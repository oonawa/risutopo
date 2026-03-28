type Props = {
	children: React.ReactNode;
};

export default function SectionTitle({ children }: Props) {
	return (
		<h2 className="text-4xl sm:text-5xl font-title text-foreground-dark-2">
			<span className="inline-block pb-2">{children}</span>
		</h2>
	);
}
