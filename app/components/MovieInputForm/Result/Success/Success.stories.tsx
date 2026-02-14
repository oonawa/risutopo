import type { Meta, StoryObj } from "@storybook/react";

import Success from "./index";

const meta: Meta<typeof Success> = {
	title: "MovieInputForm/Success",
	component: Success,
};

export default meta;

type Story = StoryObj<typeof Success>;

export const Default: Story = {
	args: {
		movie: {
			title: "ジュラシック・パーク",
			url: "https://watch.amazon.co.jp/detail?gti=amzn1.dv.gti.7ea9f6d9-bdc8-9b2e-97a9-c341306e36ef&territory=JP&ref_=share_ios_movie&r=web",
			serviceName: "Prime Video",
			serviceSlug: "prime-video",
		},
		onClick: () => {},
	},
};
