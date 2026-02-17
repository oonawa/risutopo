import type { SupportedServiceName } from "@/app/consts";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogDescription,
} from "@/components/ui/dialog";
import ListItemCard from "../Card";

export default function ListItemDetail({
	title,
	serviceName,
	watchUrl,
}: {
	title: string;
	serviceName: SupportedServiceName;
	watchUrl: string;
}) {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<ListItemCard title={title} serviceName={serviceName} />
			</DialogTrigger>
			<DialogContent className="p-0 max-w-[calc(100%-1rem)] sm:max-w-[40%]">
				<DialogHeader className="w-full gap-0 text-left">
					<div className="w-full bg-background-dark-1 rounded-tl-lg rounded-tr-lg aspect-3/1"></div>

					<div className="px-4">
						<span className="p-2 block">{serviceName}</span>
						<DialogTitle className="text-left">
							<a href={watchUrl} target="_blank" rel="noopener noreferrer">
								{title}
							</a>
						</DialogTitle>
					</div>
				</DialogHeader>
				<DialogDescription></DialogDescription>
			</DialogContent>
		</Dialog>
	);
}
