"use client";

import { useState } from "react";
import Tab from "./Tab";

type Props = {
	initialIsMobile: boolean;
	userAgent: string;
	MobileForm: React.ReactNode;
	PcForm: React.ReactNode;
};

export default function MovieInputForm({
	initialIsMobile,
	userAgent,
	MobileForm,
	PcForm,
}: Props) {
	const isTouchDevice =
		typeof window !== "undefined" &&
		("ontouchstart" in window || navigator.maxTouchPoints > 0);
	const isMac = /Macintosh|MacIntel|MacPPC|Mac68K/i.test(userAgent);

	const isMobile = initialIsMobile || (isTouchDevice && isMac);

	const [activeTab, setActiveTab] = useState<"pc" | "mobile">(
		isMobile ? "mobile" : "pc",
	);

	return (
		<div className="flex justify-center md:p-4 w-[90dvw] md:w-[60dvw] max-w-150 h-full max-h-[70dvh]">
			<div className="absolute grid grid-cols-2 gap-2 border border-background-light-2 rounded-full p-2 bg-background">
				<Tab onClick={() => setActiveTab("pc")} isActive={activeTab === "pc"}>
					PC
				</Tab>
				<Tab
					onClick={() => setActiveTab("mobile")}
					isActive={activeTab === "mobile"}
				>
					モバイル
				</Tab>
			</div>
			<div className="w-full h-full flex items-center">
				{activeTab === "pc" ? PcForm : MobileForm}
			</div>
		</div>
	);
}
