import { deleteSessionTokenByToken } from "../repositories/authTokenRepository";

export async function logoutService({
	sessionToken,
}: {
	sessionToken: string;
}) {
	await deleteSessionTokenByToken({ sessionToken });
}
