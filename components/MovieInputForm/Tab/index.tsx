type Props = {
	children: React.ReactNode;
	onClick: () => void;
	isActive?: boolean;
};

export default function Tab({ children, onClick, isActive }: Props) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`px-3 md:px-6 py-1 md:py-3 font-medium text-foreground-dark-3 flex justify-center rounded-full transition-colors hover:bg-background-light-2 ${
				isActive ? "bg-background-light-1 text-foreground-dark-2" : ""
			}`}
		>
			{children}
		</button>
	);
}
