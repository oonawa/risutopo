import { describe, it, expect } from "vitest";
import { sortItems } from "./sortListItems";
import type { ListItem } from "../types/ListItem";

const makeItem = (
	listItemId: string,
	createdAt: Date,
	details?: { releaseDate?: string; runningMinutes?: number },
): ListItem => ({
	listItemId,
	title: listItemId,
	url: `https://example.com/${listItemId}`,
	serviceSlug: "unext",
	serviceName: "U-NEXT",
	createdAt,
	isWatched: false,
	watchedAt: null,
	...(details !== undefined
		? {
				details: {
					movieId: 1,
					officialTitle: listItemId,
					backgroundImage: "https://example.com/bg.jpg",
					posterImage: "https://example.com/poster.jpg",
					director: [],
					runningMinutes: details.runningMinutes ?? 90,
					releaseYear: 2000,
					releaseDate: details.releaseDate,
					externalDatabaseMovieId: 1,
					overview: "",
				},
			}
		: {}),
});

const itemA = makeItem("a", new Date("2024-01-01"), { releaseDate: "2000-01-01", runningMinutes: 60 });
const itemB = makeItem("b", new Date("2024-03-01"), { releaseDate: "2010-06-15", runningMinutes: 120 });
const itemC = makeItem("c", new Date("2024-02-01")); // details なし

describe("sortItems - createdAt", () => {
	it("createdAt_desc: 追加日の新しい順に並ぶ", () => {
		const result = sortItems([itemA, itemC, itemB], "createdAt", "desc");
		expect(result.map((i) => i.listItemId)).toEqual(["b", "c", "a"]);
	});

	it("createdAt_asc: 追加日の古い順に並ぶ", () => {
		const result = sortItems([itemB, itemC, itemA], "createdAt", "asc");
		expect(result.map((i) => i.listItemId)).toEqual(["a", "c", "b"]);
	});
});

describe("sortItems - releaseDate", () => {
	it("releaseDate_desc: details有りが新しい順、details無しは後ろ", () => {
		const result = sortItems([itemA, itemC, itemB], "releaseDate", "desc");
		expect(result.map((i) => i.listItemId)).toEqual(["b", "a", "c"]);
	});

	it("releaseDate_asc: details有りが古い順、details無しは後ろ", () => {
		const result = sortItems([itemB, itemC, itemA], "releaseDate", "asc");
		expect(result.map((i) => i.listItemId)).toEqual(["a", "b", "c"]);
	});
});

describe("sortItems - runningMinutes", () => {
	it("runningMinutes_desc: details有りが長い順、details無しは後ろ", () => {
		const result = sortItems([itemA, itemC, itemB], "runningMinutes", "desc");
		expect(result.map((i) => i.listItemId)).toEqual(["b", "a", "c"]);
	});

	it("runningMinutes_asc: details有りが短い順、details無しは後ろ", () => {
		const result = sortItems([itemB, itemC, itemA], "runningMinutes", "asc");
		expect(result.map((i) => i.listItemId)).toEqual(["a", "b", "c"]);
	});
});
