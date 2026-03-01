import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Tokyo");

export const formatDate = (date: Date, format?: string) => {
	return dayjs(date).tz().format(format ?? "YYYY-MM-DD");
};

export const formatRelativeDate = (date: Date) => {
	const now = dayjs().tz();
	const target = dayjs(date).tz();

	if (target.isAfter(now)) {
		return "0秒前";
	}

	const years = now.diff(target, "year");
	if (years >= 1) {
		if (years === 1) {
			return "一年前";
		}

		return `${years}年前`;
	}

	const months = now.diff(target, "month");
	if (months >= 1) {
		return `${months}ヶ月前`;
	}

	const weeks = now.diff(target, "week");
	if (weeks >= 1) {
		return `${weeks}週間前`;
	}

	const days = now.diff(target, "day");
	if (days >= 1) {
		return `${days}日前`;
	}

	const hours = now.diff(target, "hour");
	if (hours >= 1) {
		return `${hours}時間前`;
	}

	const minutes = now.diff(target, "minute");
	if (minutes >= 1) {
		return `${minutes}分前`;
	}

	const seconds = now.diff(target, "second");
	return `${seconds}秒前`;
};
