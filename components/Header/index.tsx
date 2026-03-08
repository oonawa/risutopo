import Logo from "../Logo";

export default function Header() {
	return (
		<header className="h-(--header-height) flex justify-center items-center border-b border-background-light-1">
			<a href="/" className="aspect-square w-10">
				<Logo />
			</a>
		</header>
	);
}
