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
			className="cursor-pointer border border-background text-foreground-dark-2 hover:border-background-light-1 hover:text-foreground-2 hover:bg-background"
		>
			ポスターをさがす
		</Button>
	);
}
