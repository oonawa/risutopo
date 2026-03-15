import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import LoginMailTemplate from "./index";

const meta = {
	title: "features/auth/components/LoginMailTemplate",
	component: LoginMailTemplate,
	parameters: {
		layout: "fullscreen",
	},
	args: {
		loginCode: "123456",
		url: "https://localhost:3000",
	},
} satisfies Meta<typeof LoginMailTemplate>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {},
};
