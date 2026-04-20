import type { SupportedServiceName } from "@/app/consts";

type Props = {
	serviceName: SupportedServiceName;
};

export default function ServiceName({ serviceName }: Props) {
	return (
		<div className="py-2 font-bold">
			<span className="inline-block py-2 px-3 border-2 border-background-light-1 rounded-md text-foreground-dark-1 text-xs">
				{serviceName}
			</span>
		</div>
	);
}
