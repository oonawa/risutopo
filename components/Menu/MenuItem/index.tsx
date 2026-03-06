export default function MenuItem({
	isCurrentPage,
	children,
}: {
	isCurrentPage: boolean;
	children: React.ReactNode;
}) {
	return (
		<li
			className={`
                        flex justify-center active:text-foreground hover:text-foreground hover:bg-background-light-1 rounded-full py-2 transition-colors
                        ${isCurrentPage ? "text-foreground" : "text-background-light-3"}
                    `}
		>
			{children}
		</li>
	);
}
