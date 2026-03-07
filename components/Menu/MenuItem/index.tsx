import Link from "next/link";

type Props = {
	href: string;
	prefetch?: boolean;
	isCurrentPage: boolean;
	children: React.ReactNode;
};

export default function MenuItem({ href, prefetch, isCurrentPage, children }: Props) {
	return (
		<li
			className={`
				flex justify-center active:text-foreground hover:text-foreground hover:bg-background-light-1 rounded-full transition-colors
				${isCurrentPage ? "text-foreground" : "text-background-light-3"}
			`}
		>
			<Link
				href={href}
				className="w-full h-full grid place-items-center"
				prefetch={prefetch}
			>
				{children}
			</Link>
		</li>
	);
}
