import type { ListItem } from "../types/ListItem";

export type SortKey = "createdAt" | "releaseDate" | "runningMinutes";
export type SortOrder = "desc" | "asc";

export const sortItems = (
	items: ListItem[],
	sortKey: SortKey,
	sortOrder: SortOrder,
): ListItem[] => {
	const direction = sortOrder === "desc" ? -1 : 1;

	return [...items].sort((a, b) => {
		if (sortKey === "createdAt") {
			return direction * (a.createdAt.getTime() - b.createdAt.getTime());
		}

		if (sortKey === "releaseDate") {
			const aDate = a.details?.releaseDate;
			const bDate = b.details?.releaseDate;
			if (!aDate && !bDate) return 0;
			if (!aDate) return 1;
			if (!bDate) return -1;
			return direction * (aDate < bDate ? -1 : aDate > bDate ? 1 : 0);
		}

		// runningMinutes
		const aMin = a.details?.runningMinutes;
		const bMin = b.details?.runningMinutes;
		if (aMin === undefined && bMin === undefined) return 0;
		if (aMin === undefined) return 1;
		if (bMin === undefined) return -1;
		return direction * (aMin - bMin);
	});
};
