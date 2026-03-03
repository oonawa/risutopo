import { z } from "zod";
import { SUPPORTED_SERVICES } from "@/app/consts";

const parseHostname = (url: string): string | null => {
	try {
		return new URL(url).hostname;
	} catch {
		return null;
	}
};

const isSupportedHost = (hostname: string): boolean => {
	return Object.values(SUPPORTED_SERVICES).some((service) => {
		return (
			hostname === service.hostname ||
			hostname.endsWith(`.${service.hostname}`)
		);
	});
};

export const movieEntrySchema = z.object({
	title: z.string().min(1, "作品タイトルを入力してください。"),
	url: z
		.string()
		.min(1, "視聴URLを入力してください。")
		.pipe(z.url({ message: "URLの形式で入力してください。" }))
		.refine((val) => {
			return new URL(val).protocol === "https:";
		}, "URLの形式で入力してください。")
		.refine((val) => {
			const hostname = parseHostname(val);
			if (!hostname) return false;
			return isSupportedHost(hostname);
		}, "このサイトは対応外です。"),
});
