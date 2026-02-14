type Props = {
	label: string;
	value: string;
    isError: boolean
};

export default function InputValue({ label, value, isError }: Props) {
	const isBlank = value.trim() === "";

	return (
		<div className="max-w-full px-2">
			<h3 className="text-xs text-center text-background-light-2 pb-1">{label}</h3>
			<p
				className={`
                    text-sm text-center break-all pb-4 font-bold block truncate
                    ${isError && "underline decoration-wavy underline-offset-4 decoration-red"}
                    ${isBlank ? "text-background-light-3": "text-background-light-2"}
                `}
			>
				{isBlank ? "（未入力）" : value}
			</p>
		</div>
	);
}
