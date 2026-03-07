import Logo from "../Logo";

export default function Header() {
	return (
		<header className="h-(--header-height) flex justify-center items-center">
			<a href="/" className="aspect-square w-10">
				<Logo />
			</a>
		</header>
	);
}
