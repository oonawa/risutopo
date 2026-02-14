import type { MovieInfo } from "@/app/types/MovieInputForm/MovieInfo";
import { Button } from "@/components/ui/button";

type Props = {
	movie: MovieInfo;
	onClick: () => void;
};

export default function Success({ movie, onClick }: Props) {
	return (
		<div className="w-full h-dvh flex justify-center items-center px-2">
			<div className="w-full max-w-125 px-4 pt-20 pb-18 bg-background-dark-1 rounded-md">
				<span className="pb-2 w-full flex justify-center">
					<h1 className="text-xl font-bold text-foreground-dark-2">
						リストへ登録しました。
					</h1>
				</span>
				<div className="block p-4 border border-background-light-2 rounded-md">
					<span className="w-full flex justify-center text-7xl">🌰</span>
					<span className="w-full flex justify-center pt-4 pb-2">
						<h2 className="font-bold text-2xl text-center">{movie.title}</h2>
					</span>
					<h3 className="text-center font-bold text-foreground-dark-2">
						{movie.serviceName}
					</h3>
				</div>

				<div className="w-full flex justify-center pt-10">
					<Button
						onClick={onClick}
						type="button"
						variant={"outline"}
						className="text-foreground-dark-3 rounded-md cursor-pointer bg-background-dark-1 border-foreground-dark-3 text-xs"
					>
						続けて登録
					</Button>
				</div>
			</div>
		</div>
	);
}
