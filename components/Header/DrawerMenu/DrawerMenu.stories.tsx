import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import DrawerMenu from "./index";

const meta = {
	component: DrawerMenu,
	args: {
		isLoggedIn: false,
	},
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	title: "components/Header/DrawerMenu",
} satisfies Meta<typeof DrawerMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

export const LoggedOut: Story = {};

export const LoggedIn: Story = {
	args: {
		isLoggedIn: true,
	},
};
