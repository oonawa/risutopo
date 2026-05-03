import { describe, it, expect } from "vitest";
import { formatFullDate } from "./date";

describe("formatFullDate", () => {
	it("日付を '1999年1月1日' 形式にフォーマットする", () => {
		const date = new Date("1999-01-01");
		expect(formatFullDate(date)).toBe("1999年1月1日");
	});

	it("月日が10以上の場合も正しくフォーマットする", () => {
		const date = new Date("2023-12-25");
		expect(formatFullDate(date)).toBe("2023年12月25日");
	});

	it("月日が1桁の場合はゼロパディングしない", () => {
		const date = new Date("2000-03-07");
		expect(formatFullDate(date)).toBe("2000年3月7日");
	});
});
