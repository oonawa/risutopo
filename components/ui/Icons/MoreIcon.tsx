export default function MoreIcon(
	props: React.SVGProps<SVGSVGElement>,
) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 16 16"
			fill="currentColor"
			{...props}
		>
			<title>さらに表示する</title>
			<path
				d="M4 7a1 1 0 1 1 0 2a1 1 0 0 1 0-2zm4 0a1 1 0 1 1 0 2a1 1 0 0 1 0-2zm4 0a1 1 0 1 1 0 2a1 1 0 0 1 0-2z"
				fillRule="nonzero"
			/>
		</svg>
	);
}
