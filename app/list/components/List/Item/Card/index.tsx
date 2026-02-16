import type { SupportedServiceName } from "@/app/consts";

export default function ListItemCard({
	title,
	serviceName,
}: {
	title: string;
	serviceName: SupportedServiceName;
}) {
	return (
		<div className="border border-background-light-2 rounded-lg pb-2">
			<div className="w-full bg-background-dark-1 rounded-tl-lg rounded-tr-lg aspect-3/1"></div>

			<div className="px-2">
				<span className="text-xs">{serviceName}</span>
				<h3>{title}</h3>
			</div>
		</div>
	);
}
