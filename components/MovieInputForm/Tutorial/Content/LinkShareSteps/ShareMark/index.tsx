import ShareArrowIcon from "@/components/ui/Icons/ShareArrowIcon";
import ShareAndroidIcon from "@/components/ui/Icons/ShareAndroidIcon";
import ShareSendIcon from "@/components/ui/Icons/ShareSendIcon";
import ShareIosIcon from "@/components/ui/Icons/ShareIosIcon";

import type { ServiceName } from "../..";

type Props = {
	serviceName: ServiceName;
};

function Content({ serviceName }: Props) {
	switch (serviceName) {
		case "Netflix":
			return (
				<div className="w-12">
					<div className="aspect-square flex flex-col justify-center">
						<div className="flex justify-center items-center">
							<ShareSendIcon className="size-6" />
						</div>
						<div className="flex justify-center text-xs">シェア</div>
					</div>
				</div>
			);

		case "Hulu":
			return (
				<div className="text-background-light-3 bg-background-light-2 rounded-full">
					<div className="flex items-center px-2 py-1">
						<div className="flex justify-center items-center">
							<ShareArrowIcon className="size-6" />
						</div>
						<div className="flex justify-center text-xs font-bold">シェア</div>
					</div>
				</div>
			);

		case "U-NEXT":
			return (
				<div className="w-12">
					<div className="aspect-square flex flex-col justify-center">
						<div className="flex justify-center items-center">
							<ShareArrowIcon className="size-6" />
						</div>
						<div className="flex justify-center text-xs font-bold">シェア</div>
					</div>
				</div>
			);

		case "Prime Video":
			return (
				<div className="w-12">
					<div className="aspect-square flex flex-col justify-center">
						<div className="flex justify-center items-center">
							<ShareAndroidIcon className="size-6" />
						</div>
						<div className="flex justify-center text-xs">共有</div>
					</div>
				</div>
			);

		case "Disney+":
			return (
				<div className="flex items-center px-2 py-1">
					<div className="flex justify-center items-center">
						<ShareIosIcon className="size-6" />
					</div>
				</div>
			);
	}
}

export default function ShareMark({ serviceName, dimmed }: Props & { dimmed?: boolean }) {
	return (
    <div className={`col-start-1 col-end-3 transition-opacity duration-300 ${dimmed ? "opacity-30" : "opacity-100"}`}>
			<Content serviceName={serviceName} />
		</div>
	);
}
