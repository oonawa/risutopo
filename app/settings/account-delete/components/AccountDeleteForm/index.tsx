"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteUser } from "@/features/user/actions/deleteUser";
import { useServerAction } from "@/features/shared/hooks/useServerAction";
import Layout from "@/app/components/auth/VerifyForm/Layout";
import { Button } from "@/components/ui/button";

export default function AccountDeleteForm() {
	const router = useRouter();
	const { execute, isPending, networkError } = useServerAction();
	const [error, setError] = useState<string | null>(null);

	const onDelete = () => {
		execute(async () => {
			const result = await deleteUser();
			if (!result.success) {
				setError(result.error.message);
				return;
			}
			router.push("/?home=true");
		});
	};

	return (
		<Layout title="アカウント削除">
			<div className="w-full flex flex-col gap-8">
				<div className="flex flex-col gap-4">
					<p className="text-foreground-dark-1">
						アカウントとすべてのリストデータが削除されます。
						<br />
						この操作は取り消せません。
					</p>
				</div>

				{(error ?? networkError) && (
					<p className="text-sm text-red-500">{error ?? networkError}</p>
				)}

				<div className="flex flex-col gap-4">
					<Button
						onClick={onDelete}
						disabled={isPending}
						variant={"outline"}
						className="w-full rounded-full border-red-light-2 hover:bg-red-light-1"
					>
						削除する
					</Button>
					<Button
						onClick={() => router.push("/")}
						disabled={isPending}
						variant={"outline"}
						className="w-full rounded-full border-background-light-1 hover:bg-background-light-1"
					>
						キャンセル
					</Button>
				</div>
			</div>
		</Layout>
	);
}
