import { z } from "zod";

export const emailSchema = z.object({
	value: z
		.email("メールアドレスの形式で入力してください。")
		.min(1, "メールアドレスを入力してください"),
});

export const loginCodeSchema = z.object({
	value: z
		.string()
		.min(1, "ログインコードを入力してください")
		.regex(/^[0-9]{6}$/, "6桁の数字を入力してください"),
});
