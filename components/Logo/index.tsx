export default function Logo(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			viewBox="0 0 750 750"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<title>りすとぽっと</title>
			<path
				d="M56 375C56 449.558 127.873 510 216.532 510H533.468C622.128 510 694 449.558 694 375C694 300.442 636.659 240 548 240C506.5 240 481.64 262.927 461 272C442.042 280.333 406.419 288 375.23 288C344.041 288 307.959 280.333 289.001 272C268.361 262.927 234 240 194.5 240C105.841 240 56 300.442 56 375Z"
				fill="currentColor"
			/>
		</svg>
	);
}
