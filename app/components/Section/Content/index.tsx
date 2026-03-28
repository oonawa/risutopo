type Props = {
	children: React.ReactNode;
};

export default function SectionContent({ children }: Props) {
	return (
		<div className="pb-5 pt-2">
			{children}
		</div>
	);
}
