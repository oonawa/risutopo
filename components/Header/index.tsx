import Link from "next/link";
import Logo from "../Logo";
import DrawerMenu from "./DrawerMenu";

export default function Header() {
	return (
		<header className="relative h-(--header-height) flex justify-center items-center border-b border-background-light-1">
			<div className="w-full h-full max-w-2xl flex justify-center">
				<div className="w-full h-full flex items-center py-4 pl-4">
					<DrawerMenu />
				</div>

				<div className="h-full aspect-square flex justify-center items-center absolute">
					<Link href="/" prefetch={true}>
						<Logo className="size-10" />
					</Link>
				</div>
			</div>
		</header>
	);
}
