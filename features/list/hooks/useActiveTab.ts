import { useEffect, useState } from "react";

export function useActiveTab() {
	const [activeTab, setActiveTab] = useState<"pc" | "mobile">("mobile");

	useEffect(() => {
		const ua = navigator.userAgent;
		const isTouchDevice =
			"ontouchstart" in window || navigator.maxTouchPoints > 0;
		// iPad でアクセスするとユーザーエージェント上は Mac になる。
		const isMac = /Macintosh|MacIntel|MacPPC|Mac68K/i.test(ua);
		// iPad ユーザーなら iPad で映画を観るはず。
		// UI最適化のため、Mac かつタッチデバイスならモバイルデバイスと判定する。
		const isMobileUA =
			/Android|iPhone|iPod|Opera Mini|IEMobile|WPDesktop/i.test(ua);
		if (!isMobileUA && (!isTouchDevice || !isMac)) {
			setActiveTab("pc");
		}
	}, []);

	return { activeTab, setActiveTab };
}
