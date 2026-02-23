import { useState } from "react";
import { Button } from "@/components/ui/button";

type Props = {
	overview: string;
};

export default function MovieCardDetailOverview({ overview }: Props) {
	const [isOverviewExpanded, setIsOverviewExpanded] = useState(false);

	return (
		<>
			<h3 className="pt-6 text-md font-bold text-foreground-dark-1">
				あらすじ
			</h3>

			<div className="pt-2">
				{!isOverviewExpanded && (
					<p
						key="summary"
						className="text-[14px] text-foreground-dark-1 text-justify line-clamp-3"
					>
						{overview}
					</p>
				)}

				{isOverviewExpanded && (
					<p className="text-[14px] text-foreground-dark-1 text-justify">
						{overview}
					</p>
				)}

				{!isOverviewExpanded && (
					<div
						key="summary-all"
						className="flex justify-end text-foreground-dark-2"
					>
						<Button
							className="px-0 text-xs underline underline-offset-2"
							onClick={() => {
								setIsOverviewExpanded(true);
							}}
						>
							つづきを読む
						</Button>
					</div>
				)}
			</div>
		</>
	);
}
