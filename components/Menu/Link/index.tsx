import Link from "next/link";

type Props = {
	href: string;
	prefetch?: boolean;
	children: React.ReactNode;
};

export default function MenuLink({ href, prefetch, children }: Props) {
	return (
		<Link
			href={href}
			className="px-8 w-full h-full grid place-items-center rounded-full hover:text-foreground hover:bg-background-light-1 transition-colors"
			prefetch={prefetch}
		>
			{children}
		</Link>
	);
}
