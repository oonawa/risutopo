"use client";

import { useState, useEffect, Fragment } from "react";
import TapIcon from "@/components/ui/Icons/TapIcon";
import { Button } from "@/components/ui/button";
import ShareMark from "./LinkShareSteps/ShareMark";
import MenuMark from "./LinkShareSteps/MenuMark";
import Description from "./LinkShareSteps/Description";
import { SUPPORTED_SERVICES } from "@/app/consts";
import "./animation.css";

export type ServiceName =
	(typeof SUPPORTED_SERVICES)[keyof typeof SUPPORTED_SERVICES]["name"];

export type MenuType = "more" | "unext-copy" | "os-copy";

type StepData =
	| { mark: "share"; description: string }
	| { mark: "menu"; menuType: MenuType; description: string };

type ServiceDataItem = {
	serviceName: ServiceName;
	shareLinkExample: string;
	steps: StepData[];
};

const serviceData: ServiceDataItem[] = [
	{
		serviceName: SUPPORTED_SERVICES.NETFLIX.name,
		shareLinkExample:
			"「 ジュラシック・パーク 」 をNetflix で今 す ぐチ ェ ッ ク \n\nhttps://www.netflix.com/jp/title/60002360?s=i&trkid=258593161&vlang=ja&trg=more",
		steps: [
			{ mark: "share", description: "作品の画面でタップ" },
			{
				mark: "menu",
				menuType: "more",
				description: "出てくるメニューでタップ",
			},
			{
				mark: "menu",
				menuType: "os-copy",
				description: "スマホのメニューでタップ",
			},
		],
	},
	{
		serviceName: SUPPORTED_SERVICES.U_NEXT.name,
		shareLinkExample:
			"「ジュラシック・パーク」をU-NEXTで視聴 https://video-share.unext.jp/video/title/SID0021132?utm_source=com.apple.UIKit.activity.CopyToPasteboard&utm_medium=social&utm_campaign=nonad-sns&rid=PM061312883",
		steps: [
			{ mark: "share", description: "作品の画面でタップ" },
			{
				mark: "menu",
				menuType: "unext-copy",
				description: "出てくるメニューでタップ",
			},
			{
				mark: "menu",
				menuType: "os-copy",
				description: "スマホのメニューでタップ",
			},
		],
	},
	{
		serviceName: SUPPORTED_SERVICES.PRIME_VIDEO.name,
		shareLinkExample:
			"やあ、ジュラシック・パーク (吹替版)を観ているよ。Prime Videoを今すぐチェックする https://watch.amazon.co.jp/detail?gti=amzn1.dv.gti.7ea9f6d9-bdc8-9b2e-97a9-c341306e36ef&territory=JP&ref_=share_ios_movie&r=web",
		steps: [
			{ mark: "share", description: "作品の画面でタップ" },
			{
				mark: "menu",
				menuType: "os-copy",
				description: "スマホのメニューでタップ",
			},
		],
	},
	{
		serviceName: SUPPORTED_SERVICES.HULU.name,
		shareLinkExample:
			"Huluで「ジュラシック･パーク」を視聴中! https://www.hulu.jp/jurassic-park",
		steps: [
			{ mark: "share", description: "作品の画面でタップ" },
			{
				mark: "menu",
				menuType: "os-copy",
				description: "スマホのメニューでタップ",
			},
		],
	},
	{
		serviceName: SUPPORTED_SERVICES.DISNEY_PLUS.name,
		shareLinkExample:
			"https://disneyplus.com/ja/browse/entity-fe34a97c-8f83-4c39-a08e-afc288e14d64?sharesource=iOS Disney+の「ダイナソー」がおすすめなので、チェックしてみてください。",
		steps: [
			{ mark: "share", description: "作品の画面でタップ" },
			{
				mark: "menu",
				menuType: "os-copy",
				description: "スマホのメニューでタップ",
			},
		],
	},
];

export default function TutorialContent() {
	const [selectedServiceName, setSelectedServiceName] =
		useState<ServiceName | null>(null);
	const [isAccordionOpen, setIsAccordionOpen] = useState(false);
	const selectedService =
		selectedServiceName !== null
			? serviceData.find(
					(service) => service.serviceName === selectedServiceName,
				)
			: null;

	const [activeStep, setActiveStep] = useState<number | null>(0);

	const handleServiceSelect = (serviceName: ServiceName) => {
		setSelectedServiceName(serviceName);
		setActiveStep(0);
	};

	useEffect(() => {
		if (!selectedService || activeStep === null) return;

		const animationDuration = 5000;
		const loopDelay = 3000;
		const totalSteps = selectedService.steps.length;

		const timer = setTimeout(() => {
			if (activeStep < totalSteps - 1) {
				setActiveStep((prev) => (prev !== null ? prev + 1 : 0));
			} else {
				const loopTimer = setTimeout(() => setActiveStep(0), loopDelay);
				return () => clearTimeout(loopTimer);
			}
		}, animationDuration);

		return () => clearTimeout(timer);
	}, [activeStep, selectedService]);

	return (
		<div className="pb-2 text-foreground-dark-2">
			<div className="grid grid-cols-2 lg:flex gap-2 lg:justify-between ">
				{serviceData.map((service) => (
					<Button
						key={service.serviceName}
						onClick={() => handleServiceSelect(service.serviceName)}
						className={`px-4 py-2 rounded-md text-xs md:text-sm font-bold transition-colors ${
							selectedServiceName === service.serviceName
								? "bg-background-light-3 text-foreground-dark-1"
								: "bg-background-light-1 text-foreground-dark-3"
						}`}
					>
						{service.serviceName}
					</Button>
				))}
			</div>

			{selectedService && (
				<div className="pt-4">
					<div className="flex flex-col items-center">
						<h3 className="text-foreground-dark-3 font-bold py-2">手順</h3>
						<div className="w-full md:max-w-[90%] border border-background-light-1 p-2 md:p-4 rounded-md">
							<div className="grid grid-cols-7 place-content-center place-items-center gap-2 md:gap-4">
								{selectedService.steps.map((step, index) => {
									const isDim = activeStep === null || index !== activeStep;

									return (
										<Fragment key={`${step.mark}-${step.description}`}>
											{step.mark === "share" ? (
												<ShareMark
													dimmed={isDim}
													serviceName={selectedService.serviceName}
												/>
											) : (
												<MenuMark dimmed={isDim} type={step.menuType} />
											)}
											<TapIcon
												className={`size-10 ${activeStep === index ? "animate-tap-shake" : ""} ${isDim ? "opacity-30" : "opacity-100"}`}
											/>
											<Description dimmed={isDim}>
												{step.description}
											</Description>
										</Fragment>
									);
								})}
							</div>
						</div>
					</div>
					<div className="pt-4 flex justify-center">
						<div className="w-full md:max-w-[90%]">
							<button
								type="button"
								onClick={() => setIsAccordionOpen((prev) => !prev)}
								className="w-full text-sm font-bold flex items-center gap-2 py-2"
							>
								<span>共有リンクの例</span>
								<span
									className="transition-transform duration-200"
									style={{
										transform: isAccordionOpen
											? "rotate(90deg)"
											: "rotate(0deg)",
									}}
								>
									▶︎
								</span>
							</button>
							<div
								className="overflow-hidden transition-all duration-300"
								style={{ maxHeight: isAccordionOpen ? "300px" : "0px" }}
							>
								<div className="w-full px-2 py-4 md:p-4 rounded-lg bg-background-light-1 mt-2">
									<blockquote className="text-sm md:text-base break-all line-clamp-3 border-l-2 border-background-light-2 pl-2 md:pl-4 text-foreground-dark-3">
										{selectedService.shareLinkExample}
									</blockquote>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
