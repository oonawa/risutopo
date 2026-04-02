export default function UnorderedList({
	children,
}: {
	children: React.ReactNode;
}) {
	return <ul className="pl-4 my-4">{children}</ul>;
}
