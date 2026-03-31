import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import ErrorPanel from ".";

const meta = {
	title: "components/auth/VerifyForm/ErrorPanel",
	component: ErrorPanel,
	parameters: {
		layout: "centered",
	},
	args: {
		onRetry: () => {},
	},
} satisfies Meta<typeof ErrorPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SendFailed: Story = {
	args: {
		title: "ログインコード送信に失敗しました。",
		message: "メール送信に不具合があります。",
	},
};

export const LoginFailed: Story = {
	args: {
		title: "ログインに失敗しました。",
		message: "使用できないログインコードです。もう一度発行してください。",
	},
};

export const SyncFailed: Story = {
	args: {
		title: "リストの同期に失敗しました。",
		message:
			"システムの内部エラーにより、ログインしていないときに追加した作品を保存できませんでした。",
		onSkip: () => {},
	},
};
