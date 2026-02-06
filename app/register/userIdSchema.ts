import { z } from "zod";

const systemReservedId = [
	"login",
	"register",
	"admin",
	"terms-and-policy",
	"edit",
	"about",
	"contact",
	"api",
	"assets",
	"_next",
	"_image",
	"404",
	"favicon.ico",
	"images",
	"risutopo",
	"resutopotto",
];

export const userIdSchema = z.object({
	userId: z
		.string()
		.min(1, "ユーザーIDを決めて、入力してください。")
		.refine(
			(val) => !systemReservedId.includes(val),
			"使えないワードが入っています。",
		)
		.regex(
			/^[a-zA-Z0-9_]+$/,
			"半角英数字とアンダースコア(_)が使用できます。",
		)
		.min(3, "ユーザー名は3文字以上で入力してください")
		.max(20, "ユーザー名は20文字以内で入力してください")
		.refine(
			(val) => !val.startsWith("_"),
			"アンダースコアで始まるIDは登録できません。",
		),
});
