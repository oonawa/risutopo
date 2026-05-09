const RESEND_LOCAL_API = "http://localhost:8005/dashboard-api/emails";
const LOGIN_CODE_PATTERN = /\b(\d{6})\b/;
const POLL_INTERVAL_MS = 300;
const POLL_TIMEOUT_MS = 10_000;

type ResendLocalEmail = {
	id: string;
	to: string[];
	html: string | null;
	text: string | null;
	subject: string;
	createdAt: string;
};

function hasEmailsArray(
	value: unknown,
): value is Record<"emails", unknown[]> {
	if (typeof value !== "object" || value === null) return false;
	const record = Object.fromEntries(Object.entries(value));
	return "emails" in record && Array.isArray(record.emails);
}

function isResendLocalEmail(value: unknown): value is ResendLocalEmail {
	if (typeof value !== "object" || value === null) return false;
	const record = Object.fromEntries(Object.entries(value));
	return "to" in record && Array.isArray(record.to);
}

/**
 * resend-local からメール一覧を取得し、指定メールアドレス宛の最新メールから
 * 6桁のログインコードを抽出して返す。
 * メールが届くまで最大10秒ポーリングする。
 */
export async function extractLoginCode(toEmail: string): Promise<string> {
	const deadline = Date.now() + POLL_TIMEOUT_MS;

	while (Date.now() < deadline) {
		const res = await fetch(`${RESEND_LOCAL_API}?limit=50`);
		if (!res.ok) {
			throw new Error(
				`resend-local API エラー: ${res.status} ${res.statusText}`,
			);
		}

		const json: unknown = await res.json();
		if (!hasEmailsArray(json)) {
			throw new Error("resend-local API レスポンスの形式が不正です");
		}

		const email = json.emails
			.filter(isResendLocalEmail)
			.find((e) =>
				e.to.some((addr) => addr.toLowerCase() === toEmail.toLowerCase()),
			);

		if (email) {
			const body = email.html ?? email.text ?? "";
			const match = LOGIN_CODE_PATTERN.exec(body);
			if (match) {
				return match[1];
			}
		}

		await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
	}

	throw new Error(
		`${toEmail} 宛のログインコードが ${POLL_TIMEOUT_MS}ms 以内に見つかりませんでした`,
	);
}
