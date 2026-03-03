import { useState } from "react";

type Props = {
	userAgent: string;
	initialIsMobile: boolean;
};

export function useActiveTab({ userAgent, initialIsMobile }: Props) {
	const isTouchDevice =
		typeof window !== "undefined" &&
		("ontouchstart" in window || navigator.maxTouchPoints > 0);

    // iPad でアクセスするとユーザーエージェント上は Mac になる。
	const isMac = /Macintosh|MacIntel|MacPPC|Mac68K/i.test(userAgent);
    
    // iPad ユーザーなら iPad で映画を観るはず。
    // UI最適化のため、Mac かつタッチデバイスならモバイルデバイスと判定する。
	const isMobile = initialIsMobile || (isTouchDevice && isMac);

	const [activeTab, setActiveTab] = useState<"pc" | "mobile">(
		isMobile ? "mobile" : "pc",
	);

	return { activeTab, setActiveTab };
}
