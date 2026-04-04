import { motion } from "motion/react";
import type { ListItem } from "@/features/list/types/ListItem";
import ExistingItemList from "../ExistingItem/List";
import ExistingListItemDetail from "../ExistingItem/Detail";
import SelectButtons from "../SelectButtons";

type Props = {
	sameMovie: ListItem | null;
	possibleDuplicateMovies: ListItem[];
	handleCloseResult: () => void;
	handleRegisterContinue: () => void;
};

export default function PossibleDuplicateItems({
	sameMovie,
	possibleDuplicateMovies,
	handleCloseResult,
	handleRegisterContinue,
}: Props) {
	return (
		<>
			<motion.div
				key="existing-item"
				initial={{ opacity: 0, y: 4 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: -4 }}
				transition={{ duration: 0.2, ease: "easeOut" }}
			>
				<div className="pt-6 px-4">
					{sameMovie ? (
						<div className="py-2 text-center text-xl font-bold">
							すでにリスト登録されています。
							<ExistingListItemDetail movie={sameMovie} />
						</div>
					) : (
						<ExistingItemList items={possibleDuplicateMovies} />
					)}
				</div>
			</motion.div>
			{!sameMovie && (
				<SelectButtons
					onCancel={handleCloseResult}
					onContinue={handleRegisterContinue}
				/>
			)}
		</>
	);
}
