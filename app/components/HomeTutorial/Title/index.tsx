export default function HomeTutorialTtle({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<span className="inline-block underline underline-offset-8 decoration-2 decoration-yellow">
			{children}
		</span>
	);
}
