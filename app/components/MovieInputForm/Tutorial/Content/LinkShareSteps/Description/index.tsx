export default function Description({
	children,
	dimmed,
}: {
	children: React.ReactNode;
	dimmed?: boolean;
}) {
	return (
		<span
			className={`col-start-4 col-end-8 transition-opacity duration-300 text-sm ${dimmed ? "opacity-30" : "opacity-100"}`}
		>
			{children}
		</span>
	);
}
