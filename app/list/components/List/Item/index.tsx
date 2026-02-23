import type { MovieInfo } from "@/app/types/MovieInputForm/MovieInfo";
import ListItemDetail from "./Detail";
import SearchButton from "./SearchButton";

type Props = {
	listId: number;
	movie: MovieInfo;
};

export default function ListItem({ movie, listId }: Props) {
	return (
		<>
			<div className="mx-2 py-2 h-full w-full sm:w-[calc(calc(100%-16px*2)/2-16px)] md:w-[calc(calc(100%-16px*2)/3-16px)] flex flex-col first">
				<div className="w-full h-full rounded-xl p-2 transition-colors hover:bg-background-light-1">
					<div className="relative aspect-video bg-background-dark-2 rounded-xl">
						<div className="w-full h-full aspect-video absolute top-0 bg-background-dark-4/85 rounded-xl">
							{movie.details ? (
								<SearchButton
									movie={movie}
									className="w-full h-full flex justify-center"
								>
									<div className="h-full aspect-square flex justify-center p-2">
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
					<div className="flex items-center gap-2 w-full pt-2 font-bold rounded-b-2x">
						<div className="p-2 bg-background-dark-4 rounded-md text-foreground-dark-1 text-xs sm:text-sm whitespace-nowrap">
							{movie.serviceName}
						</div>
						<h2 className="text-sm line-clamp-2 min-w-0 w-full">
							{movie.title}
						</h2>
					</div>
				</div>
			</div>

			<ListItemDetail listId={listId} />
		</>
	);
}
