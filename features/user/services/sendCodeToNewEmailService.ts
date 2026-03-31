import type { Result } from "@/features/shared/types/Result";
import { sendLoginCodeService } from "@/features/auth/services/sendLoginCodeService";
import { checkEmailExists } from "../repositories/userEmailRepository";

export async function sendCodeToNewEmailService({
	newEmail,
	ipAddress,
	now,
}: {
	newEmail: string;
	ipAddress: string;
	now: Date;
}): Promise<Result> {
	const emailTaken = await checkEmailExists(newEmail);
	if (emailTaken) {
		return {
			success: false,
			error: {
				code: "VALIDATION_ERROR",
				message: "このメールアドレスは使用できません。",
			},
		};
	}

	return await sendLoginCodeService({ email: newEmail, ipAddress, now });
}
