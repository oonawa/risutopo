type Props = {
	isCurrentPage: boolean;
	children: React.ReactNode;
};

export default function MenuItem({ isCurrentPage, children }: Props) {
	return (
		<li
			className={`
				${isCurrentPage ? "text-foreground" : "text-background-light-3"} 
				flex justify-center rounded-full
			`}
		>
			{children}
		</li>
	);
}
