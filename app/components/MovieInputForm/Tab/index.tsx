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
			className={`border px-3 md:px-6 py-1 font-medium text-foreground-dark-3 flex justify-center rounded-full transition-colors ${
				isActive ? "border-background-light-1" : "border-background hover:border-background-light-2"
			}`}
		>
			{children}
		</button>
	);
}
