import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import DrawerMenu from "./index";

const meta = {
	component: DrawerMenu,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	title: "components/Header/DrawerMenu",
} satisfies Meta<typeof DrawerMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

export const LoggedOut: Story = {
	args: {
		userEmail: null,
	},
};

export const LoggedIn: Story = {
	args: {
		userEmail: "risutopo@xxxxxxxxxx.com",
	},
};
