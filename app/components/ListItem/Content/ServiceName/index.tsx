import type { SupportedServiceName } from "@/app/consts";

type Props = {
	serviceName: SupportedServiceName;
};

export default function ServiceName({ serviceName }: Props) {
	return (
		<div className="py-2 font-bold">
			<span className="inline-block p-2 bg-background-dark-4 rounded-md text-foreground-dark-1 text-xs">
				{serviceName}
			</span>
		</div>
	);
}
