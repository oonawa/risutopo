import { useState } from "react";
import type { MovieInfo } from "@/app/types/MovieInputForm/MovieInfo";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import ArrowCircleLeftIcon from "@/components/ui/Icons/ArrowCircleLeftIcon";

type Props = {
	movie: MovieInfo;
	onSearch: () => void;
	onCancel?: () => void;
	onSubmit?: () => void;
	isSearchPending: boolean;
	isSubmitPending: boolean;
	submitResult?: boolean;
	submitErrorMessage?: string;
	isLoggedIn: boolean;
};

export default function MovieCardDetail({
	movie,
	onSearch,
	onSubmit,
	onCancel,
	isSearchPending,
	isSubmitPending,
	submitResult,
	submitErrorMessage,
	isLoggedIn,
}: Props) {
	const [showOverview, setShowOverview] = useState(false);
	return (
		<>
			<div className="w-full">
				<div className="aspect-video bg-background-dark-2 rounded-t-2xl">
					{movie.details ? (
						<div className="relative h-full">
							<div className="absolute top-0 bg-background-dark-4/85 rounded-t-2xl">
								<AnimatePresence mode="wait" initial={false}>
									{showOverview ? (
										<motion.div
											key="overview"
											initial={{ opacity: 0, y: -12 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: 12 }}
											transition={{ duration: 0.2, ease: "easeOut" }}
											className="p-4 w-full aspect-video overflow-scroll flex flex-col justify-between"
										>
											<div className="pb-2 text-foreground-dark-3">
												<Button
													onClick={() => {
														setShowOverview(false);
													}}
													className="has-[>svg]:p-0"
												>
													<ArrowCircleLeftIcon />
													もどる
												</Button>
											</div>
											<div>
												<h2 className="text-lg sm:text-xl pt-2 font-bold">
													{movie.title}
												</h2>
												<p className="text-sm sm:text-base pt-4 whitespace-break-spaces leading-6 tracking-wide">
													{movie.details.overview.replace(/。(?!$)/g, "。\n")}
												</p>
											</div>
											<div className="pt-4 pb-8 text-foreground-dark-3">
												<Button
													onClick={() => {
														setShowOverview(false);
													}}
													className="has-[>svg]:px-0"
												>
													<ArrowCircleLeftIcon />
													もどる
												</Button>
											</div>
										</motion.div>
									) : (
										<motion.div
											key="summary"
											initial={{ opacity: 0, y: -12 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: 12 }}
											transition={{ duration: 0.2, ease: "easeOut" }}
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
											<div className="pr-4 py-2 sm:pt-4">
												<h2 className="sm:text-xl text-foreground">
													<span className="font-bold">{movie.title}</span>
												</h2>
												<p className="text-xs text-foreground-dark-2 flex gap-4 pt-1">
													{movie.details.releaseYear}年
													<span>{movie.details.runnningMinutes}分</span>
												</p>
												<p className="text-xs sm:text-base text-foreground-dark-1 line-clamp-3 pt-4 text-justify">
													{movie.details.overview}
												</p>
												<div className="flex justify-end">
													<Button
														onClick={() => {
															setShowOverview(true);
														}}
														className="text-xs text-foreground-dark-3 underline px-0 py-1"
													>
														もっと読む
													</Button>
												</div>
											</div>
										</motion.div>
									)}
								</AnimatePresence>
							</div>
							<img
								className="w-full h-full object-contain rounded-t-2xl"
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
				<div className="p-2 font-bold bg-background-dark-3 rounded-b-2xl">
					<span className="inline-block p-2 bg-background-dark-4 rounded-md text-foreground-dark-1 text-xs sm:text-base">
						{movie.serviceName}
					</span>

					{movie.details && (
						<h3 className="col-start-1 col-end-5 font-bold text-foreground-dark-1 text-xs px-2 py-2">
							<span className="text-xs text-foreground-dark-3 block">監督</span>
							{movie.details.director.length > 1
								? movie.details.director.join("、")
								: movie.details.director.join()}
						</h3>
					)}
				</div>
			</div>
			<div className="pt-6">
				<AnimatePresence mode="wait" initial={false}>
					{submitResult === undefined && (
						<motion.div
							key="submit-idle"
							initial={{ opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -8 }}
							transition={{ duration: 0.2, ease: "easeOut" }}
						>
							<Button
								disabled={isSubmitPending}
								onClick={onSubmit}
								variant={"outline"}
								className="w-full border-background-light-2 hover:border-background-light-3 hover:bg-background-light-1"
							>
								これで登録する
							</Button>
							{onSubmit && onCancel && (
								<div className="flex justify-start text-foreground-dark-3 pt-4">
									<Button className="px-0" onClick={onCancel}>
										<ArrowCircleLeftIcon />
										選び直す
									</Button>
								</div>
							)}
						</motion.div>
					)}

					{submitResult === true && (
						<motion.div
							key="submit-success"
							initial={{ opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -8 }}
							transition={{ duration: 0.2, ease: "easeOut" }}
						>
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
						</motion.div>
					)}

					{submitResult === false && (
						<motion.div
							key="submit-failed"
							initial={{ opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -8 }}
							transition={{ duration: 0.2, ease: "easeOut" }}
						>
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
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</>
	);
}
