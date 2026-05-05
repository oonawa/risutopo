import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { deviceTabAtom } from "@/features/list/atoms/deviceTabAtom";

export function useActiveTab(defaultTab?: "mobile") {
	const [deviceTab, setDeviceTab] = useAtom(deviceTabAtom);
	const [activeTab, setActiveTab] = useState<"pc" | "mobile" | undefined>(
		defaultTab ?? deviceTab,
	);

	useEffect(() => {
		if (defaultTab !== undefined || deviceTab !== undefined) return;
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
			setDeviceTab("pc");
			setActiveTab("pc");
		} else {
			setDeviceTab("mobile");
			setActiveTab("mobile");
		}
	}, [defaultTab, deviceTab, setDeviceTab]);

	return { activeTab, setActiveTab, deviceTab };
}
