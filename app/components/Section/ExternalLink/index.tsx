export default function ExternalLink({
	href,
	children,
}: {
	href: string;
	children: React.ReactNode;
}) {
	return (
		<a
			target="_blank"
			href={href}
			className="text-foreground-dark-2 underline underline-offset-4 decoration-foreground-dark-3"
			rel="noopener noreferrer"
		>
			{children}
		</a>
	);
}
