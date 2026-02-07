type Props = {
	children: React.ReactNode;
};

export default function FormContainer({ children }: Props) {
	return (
		<div className="h-dvh w-dvw flex items-center justify-center">
			<div className="flex flex-col items-center justify-center md:p-4 w-[90dvw] md:w-[60dvw] max-w-150 h-full max-h-[70dvh]">
				<div className="w-full h-full flex items-center">{children}</div>
			</div>
		</div>
	);
}
