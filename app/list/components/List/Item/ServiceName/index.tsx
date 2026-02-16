import type { SupportedServiceSlug, SupportedServiceName } from "@/app/consts";
export default function ServiceName({
	serviceSlug,
	serviceName,
}: {
	serviceSlug: SupportedServiceSlug;
	serviceName: SupportedServiceName;
}) {
    // TODO：serviceSlug で背景色を切り替える
    // デザインの調整ができたらサービスごとの色を決める
	return <span className="bg-background">{serviceName}</span>;
}
