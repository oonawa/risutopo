import type { Meta, StoryObj } from "@storybook/react";
import { movieInfoSchema } from "@/app/movieInfoSchema";
import { movieShareLinkSchema } from "@/app/movieShareLinkSchema";
import Failed from "./index";

const meta: Meta<typeof Failed> = {
	title: "MovieInputForm/Failed",
	component: Failed,
};

export default meta;

type Story = StoryObj<typeof Failed>;

export const Default: Story = {
	args: {
		error: { message: "すみませんが、もう一度やり直してください。" },
		inputValues: {
			mobile: {
				shareLink: "https://example.com/share?title=example&service=netflix",
			},
		},
	},
};

export const CANT_READ_SERVICE_NAME: Story = {
	args: {
		error: {
			message:
				"ストリーミングサービスを読み取れませんでした。もう一度やり直してください。",
		},
		inputValues: {
			browser: {
				title: "テスト映画",
				url: "https://example.com/movie",
			},
		},
	},
};

export const CANT_READ_URL: Story = {
	args: {
		error: {
			message: "URLを読み取れませんでした。もう一度やり直してください。",
		},
		inputValues: {
			mobile: {
				shareLink: "https://example.com/invalid",
			},
		},
	},
};

export const VALUE_ALL_BLANK: Story = {
	args: {
		error: movieInfoSchema.safeParse({ title: "", url: "" }).error,
		inputValues: {
			browser: {
				title: "",
				url: "",
			},
		},
	},
};

export const TITLE_BLANK: Story = {
	args: {
		error: movieInfoSchema.safeParse({
			title: "",
			url: "https://video-share.unext.jp/video/title/SID0021132?utm_source=com.apple.UIKit.activity.CopyToPasteboard&utm_medium=social&utm_campaign=nonad-sns&rid=PM061312883",
		}).error,
		inputValues: {
			browser: {
				title: "",
				url: "https://video-share.unext.jp/video/title/SID0021132?utm_source=com.apple.UIKit.activity.CopyToPasteboard&utm_medium=social&utm_campaign=nonad-sns&rid=PM061312883",
			},
		},
	},
};

export const URL_BLANK: Story = {
	args: {
		error: movieInfoSchema.safeParse({
			title: "ジュラシック・パーク",
			url: "",
		}).error,
		inputValues: {
			browser: {
				title: "ジュラシック・パーク",
				url: "",
			},
		},
	},
};

export const INVAILD_URL: Story = {
	args: {
		error: movieInfoSchema.safeParse({
			title: "ジュラシック・パーク",
			url: "ttps://video-share.unext.jp/video/title/SID0021132?utm_source=com.apple.UIKit.activity.CopyToPasteboard&utm_medium=social&utm_campaign=nonad-sns&rid=PM061312883",
		}).error,
		inputValues: {
			browser: {
				title: "ジュラシック・パーク",
				url: "ttps://video-share.unext.jp/video/title/SID0021132?utm_source=com.apple.UIKit.activity.CopyToPasteboard&utm_medium=social&utm_campaign=nonad-sns&rid=PM061312883",
			},
		},
	},
};

export const INVAILD_SITE_URL: Story = {
	args: {
		error: movieInfoSchema.safeParse({
			title: "エド・シーランのアルバム",
			url: "https://open.spotify.com/intl-ja/album/3T4tUhGYeRNVUGevb0wThu?si=Smh0nnFYR-KFiOEXcp6ynw",
		}).error,
		inputValues: {
			browser: {
				title: "エド・シーランのアルバム",
				url: "https://open.spotify.com/intl-ja/album/3T4tUhGYeRNVUGevb0wThu?si=Smh0nnFYR-KFiOEXcp6ynw",
			},
		},
	},
};

export const SHARE_LINK_BLANK: Story = {
	args: {
		error: movieShareLinkSchema.safeParse({
			value: "",
		}).error,
		inputValues: {
			mobile: {
				shareLink: "",
			},
		},
	},
};

export const INVAILD_SHARE_LINK: Story = {
	args: {
		error: movieShareLinkSchema.safeParse({
			value: "https://open.spotify.com/intl-ja/album/3T4tUhGYeRNVUGevb0wThu?si=Smh0nnFYR-KFiOEXcp6ynw",
		}).error,
		inputValues: {
			mobile: {
				shareLink: "https://open.spotify.com/intl-ja/album/3T4tUhGYeRNVUGevb0wThu?si=Smh0nnFYR-KFiOEXcp6ynw",
			},
		},
	},
};
