import type { MovieInfo } from "@/app/types/MovieInputForm/MovieInfo";
import { AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import ArrowCircleRightIcon from "@/components/ui/Icons/ArrowCircleRightIcon";
import MovieCardDetailMenu from "./Menu";
import MovieCardDetailOverview from "./Overview";
import Transition from "./Transition";

type Props = {
	movie: MovieInfo;
	ctaMode: "watch" | "register";
	resultState: "idle" | "success" | "error";
	onSearch: () => void;
	onSubmit?: () => void;
	onRemove?: () => void;
	onCancel: () => void;
	isSearchPending: boolean;
	isSubmitPending: boolean;
	isRemovePending: boolean;
	submitErrorMessage?: string;
	isLoggedIn: boolean;
	isSameMovie?: boolean;
};

export default function MovieCardDetail({
	movie,
	ctaMode,
	resultState,
	onSearch,
	onSubmit,
	onRemove,
	onCancel,
	isSearchPending,
	isSubmitPending,
	isRemovePending,
	submitErrorMessage,
	isLoggedIn,
	isSameMovie = false,
}: Props) {
	const isWatchMode =
		ctaMode === "watch" || (ctaMode === "register" && isSameMovie);
	const isRegisterMode = ctaMode === "register" && !isSameMovie;

	return (
		<>
			<div className="w-full">
				<div className="aspect-video bg-background-dark-2 rounded-2xl">
					{movie.details ? (
						<div className="relative h-full">
							<div className="absolute top-0 bg-background-dark-4/85 rounded-2xl">
								<AnimatePresence mode="wait" initial={false}>
									<Transition
										key="summary"
										className="w-full aspect-video grid grid-cols-2"
									>
										<div className="col-start-1 col-end-2 flex items-center">
											<div className="w-full aspect-square flex justify-center">
												<img
													className="object-contain h-full rounded-sm"
													src={movie.details.posterImage}
													alt=""
												/>
											</div>
										</div>
										<div className="pr-4 py-2 sm:pt-4 flex items-center">
											<div>
												<h2 className="sm:text-xl text-foreground">
													<span className="font-bold">{movie.title}</span>
												</h2>
												<h3 className="font-bold text-foreground-dark-1 text-xs pt-4">
													<span className="block text-xs text-foreground-dark-3">
														監督
													</span>
													{movie.details.director.length > 1
														? movie.details.director.join("、")
														: movie.details.director.join()}
												</h3>
												<div className="grid grid-cols-2 pt-1">
													<p className="font-bold text-foreground-dark-1 text-xs pt-1">
														<span className="block text-xs text-foreground-dark-3">
															公開
														</span>
														{movie.details.releaseYear}年
													</p>
													<p className="font-bold text-foreground-dark-1 text-xs pt-1">
														<span className="block text-xs text-foreground-dark-3">
															上映時間
														</span>
														{movie.details.runnningMinutes}分
													</p>
												</div>
											</div>
										</div>
									</Transition>
								</AnimatePresence>
							</div>
							<img
								className="w-full h-full object-contain rounded-2xl"
								src={movie.details.backgroundImage}
								alt=""
							/>
						</div>
					) : (
						<div className="relative w-full h-full p-4 grid place-items-center">
							<h2 className="text-xl font-bold text-foreground-dark-1 pt-2">
								{movie.title}
							</h2>
							<div className="bottom-4 sm:bottom-10 absolute ">
								<Button
									disabled={isSearchPending}
									onClick={() => {
										onSearch();
									}}
									className="border border-background text-foreground-dark-2 hover:border-background-light-1 hover:text-foreground-2 hover:bg-background"
								>
									ポスターをさがす
								</Button>
							</div>
						</div>
					)}
				</div>
			</div>
			<div className="">
				<div className="py-2 font-bold">
					<span className="inline-block p-2 bg-background-dark-4 rounded-md text-foreground-dark-1 text-xs">
						{movie.serviceName}
					</span>
				</div>
				<AnimatePresence mode="wait" initial={false}>
					{resultState === "idle" && isWatchMode && (
						<Transition key="watch-idle">
							<div className="flex gap-2">
								<a
									href={movie.url}
									target="_blank"
									rel="noopener"
									className="block w-full transition-colors border border-background-light-1 p-2 rounded-md text-foreground-dark-2 hover:text-foreground hover:bg-background-light-1 hover:border-background-light-2"
								>
									<span className="flex gap-2 items-center justify-center font-bold">
										視聴する
										<ArrowCircleRightIcon className="w-6" />
									</span>
								</a>
								<MovieCardDetailMenu
									searchDisabled={isSearchPending}
									removeDisabled={isRemovePending}
									onSearch={() => {
										onCancel();
										onSearch();
									}}
									onRemove={onRemove}
								/>
							</div>
						</Transition>
					)}
					{resultState === "idle" && isRegisterMode && (
						<Transition key="register-idle">
							<div className="flex gap-2">
								<Button
									disabled={isSubmitPending}
									onClick={onSubmit}
									variant={"outline"}
									className="flex-1 py-5 border-background-light-2 hover:border-background-light-3 hover:bg-background-light-1"
								>
									これで登録する
								</Button>
								<MovieCardDetailMenu
									searchDisabled={isSearchPending}
									removeDisabled={isRemovePending}
									onSearch={() => {
										onCancel();
										onSearch();
									}}
									onRemove={onRemove}
								/>
							</div>
						</Transition>
					)}

					{resultState === "success" && (
						<Transition key="submit-success">
							<div className="border border-background-light-1 rounded-md py-4 px-2 text-center">
								<div className="text-xl font-bold underline underline-offset-4 decoration-green decoration-2 ">
									保存されました！
								</div>
								{!isLoggedIn && (
									<div className="text-sm text-foreground-dark-2 pt-2">
										このデバイスにのみ保存されています。
									</div>
								)}
							</div>
							{!isLoggedIn && (
								<div className="text-xs text-foreground-dark-2 pt-2 flex justify-end">
									複数デバイスで同期するには
									<a href="/login" className="underline underline-offset-2">
										アカウントを作成
									</a>
									してください。
								</div>
							)}
						</Transition>
					)}

					{resultState === "error" && (
						<Transition key="submit-failed">
							<div className="border border-background-light-1 rounded-md py-4 px-2 text-center">
								<div className="text-xl font-bold underline underline-offset-4 decoration-red-light-2 decoration-2">
									保存に失敗しました
								</div>
								{submitErrorMessage && (
									<p className="pt-2 text-sm text-foreground-dark-2">
										{submitErrorMessage}
									</p>
								)}
							</div>
						</Transition>
					)}
				</AnimatePresence>
			</div>

			{movie.details && (
				<MovieCardDetailOverview overview={movie.details.overview} />
			)}
		</>
	);
}
