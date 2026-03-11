"use server";

import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import crypto from "node:crypto";
import { Resend } from "resend";
import { checkRateLimit, recordAttempt } from "../services/rateLimit";
import type { Result } from "@/features/shared/types/Result";
import { db } from "@/db/client";
import type { Tx } from "@/db/client";
import { authTokensTable, usersTable } from "@/db/schema";
import { emailSchema } from "../schemas/loginSchemas";
import LoginMailTemplate from "../components/LoginMailTemplate";

export async function sendLoginCode(email: string, now: Date): Promise<Result> {
	const headersList = await headers();

	const { limit, ipAddress } = await checkRateLimit({
		ipAddress:
			headersList.get("x-forwarded-for")?.split(",")[0] ||
			headersList.get("x-real-ip") ||
			"unknown",
		attemptType: "code_send",
	});

	if (!limit.allowed && limit.retryAfter) {
		const minutesUntilRetry = Math.ceil(
			(limit.retryAfter.getTime() - now.getTime()) / 60000,
		);

		return {
			success: false,
			error: {
				code: "VALIDATION_ERROR",
				message: `送信回数が上限に達しました。${minutesUntilRetry}分後に再度お試しください。`,
			},
		};
	}

	const result = validateEmail(email);

	if (!result.success) {
		return {
			success: false,
			error: { code: "VALIDATION_ERROR", message: "メールアドレスが不正です" },
		};
	}

	if (!process.env.RESEND_API_KEY) {
		console.error("Resend のAPIキーが設定されていません");
		return {
			success: false,
			error: {
				code: "INTERNAL_ERROR",
				message: "メール送信に不具合が見つかりました。",
			},
		};
	}

	const loginCode = generateLoginCode();

	try {
		await db.transaction(async (tx) => {
			await deleteLoginCode({ tx, email });
			await insertLoginCode({
				tx,
				email,
				token: hashLoginCode(loginCode),
				expiresAt: createExpiresAt(now),
				createdAt: now,
			});
		});

		const response = await sendLoginMail({
			email,
			loginCode,
			url: resolveBaseUrl(),
		});

		if (response.error) {
			await deleteLoginCode({ email });

			await recordAttempt({
				executor: db,
				ipAddress,
				email,
				attemptType: "code_send",
				success: false,
			});

			console.error(response.error);

			return {
				success: false,
				error: {
					code: "INTERNAL_ERROR",
					message: "メール送信に不具合があります。",
				},
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
			error: {
				code: "INTERNAL_ERROR",
				message: "メール送信に不具合があります。",
			},
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

function createExpiresAt(now: Date) {
	return new Date(now.getTime() + 10 * 60 * 1000);
}

function resolveBaseUrl() {
	return process.env.VERCEL_URL
		? `https://${process.env.VERCEL_URL}`
		: "http://localhost:4321";
}

async function deleteLoginCode({ tx, email }: { tx?: Tx; email: string }) {
	const executor = tx || db;
	await executor
		.delete(authTokensTable)
		.where(
			and(
				eq(authTokensTable.email, email),
				eq(authTokensTable.tokenType, "login_code"),
			),
		);
}

async function insertLoginCode({
	tx,
	email,
	token,
	expiresAt,
	createdAt,
}: {
	tx: Tx;
	email: string;
	token: string;
	expiresAt: Date;
	createdAt: Date;
}) {
	const [user] = await tx
		.select()
		.from(usersTable)
		.where(eq(usersTable.email, email));

	await tx.insert(authTokensTable).values({
		token,
		tokenType: "login_code",
		email,
		userId: user?.id ?? null,
		expiresAt,
		createdAt,
	});
}

async function sendLoginMail({
	email,
	loginCode,
	url,
}: {
	email: string;
	loginCode: string;
	url: string;
}) {
	const resend = new Resend(process.env.RESEND_API_KEY);

	return await resend.emails.send({
		from:
			process.env.NODE_ENV === "development"
				? "onboarding@resend.dev"
				: "りすとぽっと <hi@risutopo.com>",
		to: email,
		subject: "【りすとぽっと】ログインコードをお送りします",
		react: LoginMailTemplate({ loginCode, url }),
	});
}
