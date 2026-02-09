import MoreCircleIcon from "@/components/ui/Icons/MoreCircleIcon";
import type { MenuType } from "../..";

type Props = {
	type: MenuType;
};

function Content({ type }: Props) {
	switch (type) {
		case "more":
			return (
				<div className="flex flex-col justify-center items-center">
					<MoreCircleIcon className="size-10" />
					<div className="text-xs text-center">
						さらに表示
						<br />
						する
					</div>
				</div>
			);
		case "unext-copy":
			return <span className="text-xs">作品名とURLをコピー</span>;
		case "os-copy":
			return <span className="text-xs">コピー</span>;
	}
}

export default function MenuMark({ type, dimmed }: Props & { dimmed?: boolean }) {
	return (
    <div className={`col-start-1 col-end-3 transition-opacity duration-300 ${dimmed ? "opacity-30" : "opacity-100"}`}>
			<Content type={type} />
		</div>
	);
}
