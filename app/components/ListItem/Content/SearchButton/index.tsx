import { Button } from "@/components/ui/button";

type Props = {
	isSearchPending: boolean;
	onSearch: () => void;
};

export default function SearchButton({ isSearchPending, onSearch }: Props) {
	return (
		<Button
			disabled={isSearchPending}
			onClick={() => {
				onSearch();
			}}
			className="cursor-pointer border border-background-light-2 text-foreground-dark-2 hover:border-background-light-2 hover:text-foreground-2 hover:bg-background-light-1"
		>
			ポスターをさがす
		</Button>
	);
}
