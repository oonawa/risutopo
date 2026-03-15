import { z } from "zod";
import { SUPPORTED_SERVICES } from "@/app/consts";

const extractUrl = (text: string): string | null => {
	return text.match(/https?:\/\/[^\s]+/)?.[0] ?? null;
};

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

export const movieShareLinkSchema = z.object({
	value: z
		.string()
		.min(1, "共有リンクを貼り付けてください。")
		.refine((val) => extractUrl(val) !== null, "URLが含まれていません。")
		.refine((val) => {
			const url = extractUrl(val);
			if (!url) return false;
			const hostname = parseHostname(url);
			if (!hostname) return false;
			return isSupportedHost(hostname);
		}, "対応サービスのURLを入力してください。"),
});
