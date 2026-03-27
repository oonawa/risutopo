export default function PersonIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			viewBox="0 0 232 361"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<title>ユーザー</title>
			<path
				d="M116 158C26.2043 158 0 175.821 0 184.292V245H232V184.292C232 176.174 205.796 158 116 158Z"
				fill="currentColor"
			/>
			<path
				d="M116 361C180.065 361 232 309.065 232 245H0C0 309.065 51.935 361 116 361Z"
				fill="currentColor"
			/>
			<circle cx="116" cy="70" r="70" fill="currentColor" />
		</svg>
	);
}
