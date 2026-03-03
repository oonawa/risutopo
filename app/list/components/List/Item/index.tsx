import { formatRelativeDate } from "@/lib/date";
import type { ListItem } from "@/features/list/types/ListItem";
import CheckMarkIcon from "@/components/ui/Icons/CheckMarkIcon";
import SearchButton from "./SearchButton";

type Props = {
	movie: ListItem;
};

export default function Item({ movie }: Props) {
	return (
		<div className="relative mx-2 py-2 h-full w-full sm:w-[calc(calc(100%-16px*2)/2-16px)] md:w-[calc(calc(100%-16px*2)/3-16px)] flex flex-col first">
			<div className="w-full h-full rounded-xl p-2 transition-colors hover:bg-background-light-1">
				<div className="relative aspect-video bg-background-dark-2 rounded-xl">
					<div className="w-full h-full aspect-video absolute top-0 bg-background-dark-4/85 rounded-xl">
						{movie.details ? (
							<SearchButton
								movie={movie}
								className="w-full h-full flex justify-center"
							>
								<div className="h-full aspect-square flex justify-center">
									<img
										className="object-contain h-full rounded-sm"
										src={movie.details?.posterImage}
										alt=""
									/>
								</div>
							</SearchButton>
						) : (
							<SearchButton
								className="w-full h-full p-4 grid place-items-center"
								movie={movie}
							/>
						)}
					</div>

					<img
						className="w-full h-full object-cover rounded-xl"
						src={movie.details?.backgroundImage}
						alt=""
					/>
				</div>
				<div className="flex gap-2 w-full rounded-b-2x pt-4 sm:pt-2">
					<div>
						<span className="p-2 bg-background-dark-4 rounded-md font-bold text-foreground-dark-1 text-xs whitespace-nowrap">
							{movie.serviceName}
						</span>
					</div>

					<div className="flex flex-col gap-1">
						<h2 className="text-sm font-bold line-clamp-2 min-w-0 w-full">
							{movie.title}
						</h2>
						<div className="flex gap-2">
							{movie.isWatched && (
								<div className="w-4 rounded-full border border-foreground-dark-2">
									<CheckMarkIcon />
								</div>
							)}
							<p className="text-xs text-foreground-dark-2">
								{formatRelativeDate(movie.createdAt)}に追加
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
