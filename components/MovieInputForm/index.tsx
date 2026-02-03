"use client";

import { useState } from "react";
import Tab from "./Tab";
import WebBrowserIcon from "../ui/Icons/WebBrowserIcon";
import MobileDeviceIcon from "../ui/Icons/MobileDeviceIcon";

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
		<div className="flex flex-col items-center justify-center md:p-4 w-[90dvw] md:w-[60dvw] max-w-150 h-full max-h-[70dvh]">
			<div className="w-full h-full flex items-center">
				{activeTab === "pc" ? PcForm : MobileForm}
			</div>

			<div className="max-w-[50dvw] grid grid-cols-2 gap-2 border border-background-light-1 rounded-full p-2 bg-background">
				<Tab onClick={() => setActiveTab("pc")} isActive={activeTab === "pc"}>
					<WebBrowserIcon className="size-5" />
				</Tab>
				<Tab
					onClick={() => setActiveTab("mobile")}
					isActive={activeTab === "mobile"}
				>
					<MobileDeviceIcon className="size-5" />
				</Tab>
			</div>
		</div>
	);
}
