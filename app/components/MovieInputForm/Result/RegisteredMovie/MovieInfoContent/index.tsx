import type { MovieInfo } from "@/app/types/MovieInputForm/MovieInfo";
import { Button } from "@/components/ui/button";

type Props = {
	movie: MovieInfo;
	onClick: () => void;
	onEnter?: () => void;
	onCancel?: () => void;
	isSearchPending: boolean;
};

export default function MovieInfoContent({
	movie,
	onClick,
	onEnter,
	onCancel,
	isSearchPending,
}: Props) {
	return (
		<>
			<h1 className="text-xl font-bold text-center">登録しました 🐿️</h1>
			<div className="pt-10">
				<div className="w-full aspect-video bg-background-dark-2 rounded-2xl">
					{movie.details ? (
						<img
							className="w-full object-contain rounded-t-2xl"
							src={movie.details.backgroundImage}
							alt=""
						/>
					) : (
						<Button
							disabled={isSearchPending}
							onClick={() => {
								onClick();
							}}
							className="w-full h-full border border-background rounded-2xl text-foreground-dark-2"
						>
							ポスター画像を検索する
						</Button>
					)}
				</div>
				<div className="pt-4 font-bold">
					<span className="p-2 bg-background-dark-3 rounded-md text-foreground-dark-1 text-xs sm:text-base">
						{movie.serviceName}
					</span>
					<h2 className="pt-2 text-xl sm:text-2xl text-foreground">
						<span className="pl-1">{movie.title}</span>
					</h2>

					{movie.details && (
						<div className="py-4 px-1 grid grid-cols-6 items-center text-xs ">
							<h3 className="col-start-1 col-end-5 font-bold text-foreground-dark-1">
								{movie.details.director.length > 1
									? movie.details.director.join("、")
									: movie.details.director.join()}
							</h3>

							<span className="flex justify-end text-foreground-dark-2">
								{movie.details.releaseYear}年
							</span>
							<span className="flex justify-end text-foreground-dark-2">
								{movie.details.runnningMinutes}分
							</span>
						</div>
					)}
				</div>
			</div>
			<div className="pt-6">
				{onEnter && onCancel && (
					<>
						<Button
							onClick={onEnter}
							variant={"outline"}
							className="w-full border-background-light-2"
						>
							これで更新する
						</Button>

						<div className="flex justify-start text-foreground-dark-3 pt-4">
							<Button className="px-0" onClick={onCancel}>
								<span className="rounded-full w-6 flex items-center justify-center aspect-square border border-background-light-2">
									←
								</span>
								選び直す
							</Button>
						</div>
					</>
				)}
			</div>
		</>
	);
}
