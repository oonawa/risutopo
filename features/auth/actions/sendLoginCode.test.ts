import { createHash } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/db/client";
import {
	authTokensTable,
	loginAttemptsTable,
	userEmailsTable,
	usersTable,
} from "@/db/schema";

const originalResendApiKey = process.env.RESEND_API_KEY;
const originalVercelUrl = process.env.VERCEL_URL;

const {
	mockHeaders,
	mockSendEmail,
	mockLoginMailTemplate,
	mockResendConstructor,
} = vi.hoisted(() => {
	const headers = vi.fn(async () => ({
		get: (name: string) => {
			if (name === "x-forwarded-for") {
				return "127.0.0.1";
			}
			return null;
		},
	}));
	const sendEmail = vi.fn(async () => ({
		data: { id: "mock-email-id" },
		error: null,
	}));
	const loginMailTemplate = vi.fn(
		({ loginCode, url }: { loginCode: string; url: string }) =>
			`loginCode:${loginCode} url:${url}`,
	);
	const resendConstructor = vi.fn(function ResendMock(
		this: {
			emails: {
				send: typeof sendEmail;
			};
		},
		_apiKey: string,
	) {
		this.emails = {
			send: sendEmail,
		};
	});

	return {
		mockHeaders: headers,
		mockSendEmail: sendEmail,
		mockLoginMailTemplate: loginMailTemplate,
		mockResendConstructor: resendConstructor,
	};
});

vi.mock("next/headers", () => ({
	headers: mockHeaders,
}));

vi.mock("resend", () => ({
	Resend: mockResendConstructor,
}));

vi.mock("../components/LoginMailTemplate", () => ({
	default: mockLoginMailTemplate,
}));

import { sendLoginCode } from "./sendLoginCode";

function hashLoginCode(loginCode: string) {
	return createHash("sha256").update(loginCode).digest("hex");
}

describe("sendLoginCode", () => {
	const now = new Date("2026-02-16T00:00:00.000Z");
	const existingUserEmail = "send-login-code-test@example.com";
	const unregisteredUserEmail = "send-login-code-unregistered@example.com";

	async function seedExistingUser() {
		const [user] = await db
			.insert(usersTable)
			.values({
				publicId: "send-login-code-test-user",
			})
			.returning();

		if (!user) {
			throw new Error("既存ユーザーのシードに失敗しました");
		}

		await db.insert(userEmailsTable).values({
			userId: user.id,
			email: existingUserEmail,
		});

		return user;
	}

	beforeEach(async () => {
		process.env.RESEND_API_KEY = "mock-resend-api-key";
		process.env.VERCEL_URL = "";

		mockHeaders.mockClear();
		mockSendEmail.mockClear();
		mockLoginMailTemplate.mockClear();
		mockResendConstructor.mockClear();

		await db.delete(loginAttemptsTable);
		await db.delete(authTokensTable);
		await db.delete(userEmailsTable);
		await db.delete(usersTable);
	});

	afterEach(() => {
		process.env.RESEND_API_KEY = originalResendApiKey;
		process.env.VERCEL_URL = originalVercelUrl;
	});

	it("【既存ユーザー】10分間有効な数字6桁の認証コードを発行し、入力されたメールアドレスへ送信する", async () => {
		const existingUser = await seedExistingUser();

		const result = await sendLoginCode(existingUserEmail, now);

		expect(result).toEqual({ success: true });

		expect(mockResendConstructor).toHaveBeenCalledTimes(1);
		expect(mockResendConstructor).toHaveBeenCalledWith("mock-resend-api-key");

		expect(mockLoginMailTemplate).toHaveBeenCalledTimes(1);
		const [templateArg] = mockLoginMailTemplate.mock.calls[0];
		expect(templateArg.url).toBe("https://localhost:3000");
		expect(templateArg.loginCode).toMatch(/^\d{6}$/);

		expect(mockSendEmail).toHaveBeenCalledTimes(1);
		expect(mockSendEmail).toHaveBeenCalledWith(
			expect.objectContaining({
				to: existingUserEmail,
				subject: "【りすとぽっと】ログインコードをお送りします",
				from: "りすとぽっと <hi@risutopo.com>",
				react: `loginCode:${templateArg.loginCode} url:https://localhost:3000`,
			}),
		);

		const [savedToken] = await db
			.select()
			.from(authTokensTable)
			.where(eq(authTokensTable.email, existingUserEmail));

		expect(savedToken).toBeDefined();
		if (!savedToken) {
			throw new Error("認証コードが保存されていません");
		}

		expect(savedToken.tokenType).toBe("login_code");
		expect(savedToken.userId).toBe(existingUser.id);
		expect(savedToken.createdAt).toEqual(now);
		expect(savedToken.expiresAt).toEqual(
			new Date(now.getTime() + 10 * 60 * 1000),
		);
		expect(savedToken.token).toBe(hashLoginCode(templateArg.loginCode));

		const [attempt] = await db
			.select()
			.from(loginAttemptsTable)
			.where(eq(loginAttemptsTable.email, existingUserEmail));

		expect(attempt).toBeDefined();
		if (!attempt) {
			throw new Error("送信試行が記録されていません");
		}

		expect(attempt.ipAddress).toBe("127.0.0.1");
		expect(attempt.attemptType).toBe("code_send");
		expect(attempt.success).toBe(true);
	});

	it("【未登録ユーザー】10分間有効な数字6桁の認証コードを発行し、入力されたメールアドレスへ送信する", async () => {
		const result = await sendLoginCode(unregisteredUserEmail, now);

		expect(result).toEqual({ success: true });

		expect(mockResendConstructor).toHaveBeenCalledTimes(1);
		expect(mockResendConstructor).toHaveBeenCalledWith("mock-resend-api-key");

		expect(mockLoginMailTemplate).toHaveBeenCalledTimes(1);
		const [templateArg] = mockLoginMailTemplate.mock.calls[0];
		expect(templateArg.url).toBe("https://localhost:3000");
		expect(templateArg.loginCode).toMatch(/^\d{6}$/);

		expect(mockSendEmail).toHaveBeenCalledTimes(1);
		expect(mockSendEmail).toHaveBeenCalledWith(
			expect.objectContaining({
				to: unregisteredUserEmail,
				subject: "【りすとぽっと】ログインコードをお送りします",
				from: "りすとぽっと <hi@risutopo.com>",
				react: `loginCode:${templateArg.loginCode} url:https://localhost:3000`,
			}),
		);

		const [savedToken] = await db
			.select()
			.from(authTokensTable)
			.where(eq(authTokensTable.email, unregisteredUserEmail));

		expect(savedToken).toBeDefined();
		if (!savedToken) {
			throw new Error("認証コードが保存されていません");
		}

		expect(savedToken.tokenType).toBe("login_code");
		expect(savedToken.userId).toBeNull();
		expect(savedToken.createdAt).toEqual(now);
		expect(savedToken.expiresAt).toEqual(
			new Date(now.getTime() + 10 * 60 * 1000),
		);
		expect(savedToken.token).toBe(hashLoginCode(templateArg.loginCode));

		const [attempt] = await db
			.select()
			.from(loginAttemptsTable)
			.where(eq(loginAttemptsTable.email, unregisteredUserEmail));

		expect(attempt).toBeDefined();
		if (!attempt) {
			throw new Error("送信試行が記録されていません");
		}

		expect(attempt.ipAddress).toBe("127.0.0.1");
		expect(attempt.attemptType).toBe("code_send");
		expect(attempt.success).toBe(true);
	});

	it("DBには同一メールアドレスの認証コードが常に最新の一件のみ登録される", async () => {
		const existingUser = await seedExistingUser();

		const oldLoginCode = "123456";
		const oldExpiresAt = new Date(now.getTime() + 5 * 60 * 1000);

		await db.insert(authTokensTable).values({
			token: hashLoginCode(oldLoginCode),
			tokenType: "login_code",
			email: existingUserEmail,
			userId: existingUser.id,
			expiresAt: oldExpiresAt,
			createdAt: new Date(now.getTime() - 60 * 1000),
		});

		await sendLoginCode(existingUserEmail, now);

		const savedTokens = await db
			.select()
			.from(authTokensTable)
			.where(
				and(
					eq(authTokensTable.email, existingUserEmail),
					eq(authTokensTable.tokenType, "login_code"),
				),
			);

		expect(savedTokens).toHaveLength(1);

		const [savedToken] = savedTokens;
		expect(savedToken).toBeDefined();
		if (!savedToken) {
			throw new Error("認証コードが保存されていません");
		}

		const [templateArg] = mockLoginMailTemplate.mock.calls[0];
		expect(savedToken.token).toBe(hashLoginCode(templateArg.loginCode));
		expect(savedToken.token).not.toBe(hashLoginCode(oldLoginCode));
		expect(savedToken.createdAt).toEqual(now);
		expect(savedToken.expiresAt).toEqual(
			new Date(now.getTime() + 10 * 60 * 1000),
		);
	});
});
