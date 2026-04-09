import type { SupportedServiceName } from "@/app/consts";

type Props = {
	serviceName: SupportedServiceName;
};

export default function ServiceName({ serviceName }: Props) {
	return (
		<div className="py-2 font-bold">
			<span className="inline-block p-2 border border-background-light-1 bg-background-dark-1 rounded-md text-foreground-dark-1 text-xs">
				{serviceName}
			</span>
		</div>
	);
}
