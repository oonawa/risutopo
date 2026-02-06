"use server";

import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";
import { Resend } from "resend";
import { checkRateLimit, recordAttempt } from "@/lib/rateLimit";
import type { Result } from "@/app/types/Result";
import { db } from "@/db/client";
import { authTokensTable, usersTable } from "@/db/schema";
import { emailSchema } from "../loginSchemas";
import LoginMailTemplate from "../components/LoginMailTemplate";

export async function sendLoginCode(email: string): Promise<Result> {
	const headersList = await headers();
	const ipAddress =
		headersList.get("x-forwarded-for")?.split(",")[0] ||
		headersList.get("x-real-ip") ||
		"unknown";

	const rateLimit = await checkRateLimit(ipAddress, "code_send");

	if (!rateLimit.allowed && rateLimit.retryAfter) {
		const minutesUntilRetry = Math.ceil(
			(rateLimit.retryAfter.getTime() - Date.now()) / 60000,
		);

		return {
			success: false,
			error: {
				message: `送信回数が上限に達しました。${minutesUntilRetry}分後に再度お試しください。`,
			},
		};
	}

	const result = validateEmail(email);

	if (!result.success) {
		return {
			success: false,
			error: { message: "メールアドレスが不正です" },
		};
	}

	if (!process.env.RESEND_API_KEY) {
		console.error("Resend のAPIキーが設定されていません");
		return {
			success: false,
			error: { message: "メール送信に不具合が見つかりました。" },
		};
	}

	const time = createTimeContext();
	const loginCode = generateLoginCode();
	const hashedCode = hashLoginCode(loginCode);
	const url = resolveBaseUrl();

	try {
		await db.transaction(async (tx) => {
			await tx
				.delete(authTokensTable)
				.where(
					and(
						eq(authTokensTable.email, email),
						eq(authTokensTable.tokenType, "login_code"),
					),
				);

			const [user] = await tx
				.select()
				.from(usersTable)
				.where(eq(usersTable.email, email));

			await tx.insert(authTokensTable).values({
				token: hashedCode,
				tokenType: "login_code",
				email,
				userId: user?.id ?? null,
				expiresAt: time.expiresAt,
				createdAt: time.now,
			});
		});

		try {
			await sendLoginMail(email, loginCode, url);
		} catch (err) {
			console.error(err);
			await db
				.delete(authTokensTable)
				.where(
					and(
						eq(authTokensTable.email, email),
						eq(authTokensTable.tokenType, "login_code"),
					),
				);
			await recordAttempt({
				executor: db,
				ipAddress,
				email,
				attemptType: "code_send",
				success: false,
			});

			return {
				success: false,
				error: { message: "メール送信に不具合があります。" },
			};
		}

		await recordAttempt({
			executor: db,
			ipAddress,
			email,
			attemptType: "code_send",
			success: true,
		});

		return {
			success: true,
		};
	} catch (err) {
		console.error(err);
		return {
			success: false,
			error: { message: "メール送信に不具合があります。" },
		};
	}
}

function validateEmail(email: string) {
	return emailSchema.safeParse({ value: email });
}

function generateLoginCode() {
	return crypto.randomInt(100000, 1000000).toString();
}

function hashLoginCode(code: string) {
	return crypto.createHash("sha256").update(code).digest("hex");
}

type TimeContext = {
	now: Date;
	expiresAt: Date;
};
function createTimeContext(): TimeContext {
	const now = new Date();
	return {
		now,
		expiresAt: new Date(now.getTime() + 10 * 60 * 1000),
	};
}

function resolveBaseUrl() {
	return process.env.VERCEL_URL
		? `https://${process.env.VERCEL_URL}`
		: "http://localhost:4321";
}

async function sendLoginMail(email: string, loginCode: string, url: string) {
	const resend = new Resend(process.env.RESEND_API_KEY);

	await resend.emails.send({
		from:
			process.env.NODE_ENV === "development"
				? "onboarding@resend.dev"
				: "りすとぽっと <risutopo.vercel.app>",
		to: email,
		subject: "【りすとぽっと】ログインコードをお送りします",
		react: LoginMailTemplate({ loginCode, url }),
	});
}
