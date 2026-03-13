"use client";

import type z from "zod";
import { redirect } from "next/navigation";
import {
	useEffect,
	useState,
	useCallback,
	useDeferredValue,
	useTransition,
} from "react";
import { useForm } from "react-hook-form";
import { useListLocalStorageRepository } from "@/features/list/repositories/client/useListLocalStorageRepository";
import { userIdSchema } from "@/features/user/schemas/userIdSchema";
import { listItemSchema } from "@/features/shared/schemas/listItemSchema";
import { registerLocalListPayloadSchema } from "@/features/user/schemas/listItemSchema";
import { searchDuplicateUserId } from "@/features/user/actions/searchDuplicateUserId";
import { registerUser } from "@/features/user/actions/registerUser";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";

type UserIdFormData = z.infer<typeof userIdSchema>;

type Props = {
	email: string;
	token: string;
};

export default function RegisterForm({ email, token }: Props) {
	const [inputValue, setInputValue] = useState("");

	const deferredInputValue = useDeferredValue(inputValue);

	const [isPending, startTransition] = useTransition();

	const [isDuplicate, setIsDuplicate] = useState(false);

	const [serverErrorMessage, setServerErrorMessage] = useState<string>("");

	const { getListItems, getListId, replaceListItems } =
		useListLocalStorageRepository();

	const {
		register,
		handleSubmit,
		formState: { errors },
		watch,
	} = useForm<UserIdFormData>({
		resolver: zodResolver(userIdSchema),
		mode: "onChange",
	});

	const value = watch("userId");

	const handleInput = useCallback((e: React.FormEvent<HTMLInputElement>) => {
		const inputValue = e.currentTarget.value;
		setInputValue(inputValue);
	}, []);

	useEffect(() => {
		let cancelled = false;

		const result = userIdSchema.safeParse({ userId: deferredInputValue });
		if (result.error?.message) {
			setIsDuplicate(false);
			return;
		}

		startTransition(async () => {
			const count = await searchDuplicateUserId(deferredInputValue);
			if (!cancelled) {
				setIsDuplicate(count > 0);
			}
		});

		return () => {
			cancelled = true;
		};
	}, [deferredInputValue]);

	const onSubmit = async (data: UserIdFormData) => {
		const rawLocalUserList = {
			listId: getListId(),
			items: getListItems(),
		};
		const parsedLocalList =
			registerLocalListPayloadSchema.safeParse(rawLocalUserList);
		const localUserList = parsedLocalList.success
			? {
					listId: parsedLocalList.data.listId,
					items: parsedLocalList.data.items.flatMap((item) => {
						const parsedItem = listItemSchema.safeParse(item);
						if (!parsedItem.success) {
							return [];
						}

						return [parsedItem.data];
					}),
				}
			: {
					listId: "",
					items: [],
				};

		const result = await registerUser({
			userId: data.userId,
			email,
			tempToken: token,
			localUserList,
			now: new Date(),
		});
		if (result.success) {
			const nextListItems =
				result.data.listItems.length === 0 && localUserList.items.length > 0
					? localUserList.items
					: result.data.listItems;

			replaceListItems(nextListItems, result.data.listPublicId);
			return redirect("/");
		}

		setServerErrorMessage(result.error.message);
	};

	return (
		<form
			className="w-full flex flex-col gap-4 pb-10"
			onSubmit={handleSubmit(onSubmit)}
		>
			<label htmlFor={"userId"}>ユーザーIDを入力</label>
			<div className="flex flex-col gap-1">
				<Input
					className="border-background-light-2 focus-visible:ring-2 focus-visible:ring-background-light-2 px-2 transition-shadow duration-300"
					placeholder="理想の名前を考えましょう。"
					type="text"
					id="userId"
					{...register("userId")}
					onInput={handleInput}
				/>
				<div className="flex items-center text-xs text-foreground-dark-3 pl-1">
					3〜20文字以内・半角の英字・数字・アンダースコア（
					<span className="px-1 py-0.5 text-xs bg-background-light-1 rounded-xs">
						_
					</span>
					）が使えます
				</div>
				{isPending && <p className="text-sm text-blue-500">確認中...</p>}
				{isDuplicate && (
					<p className="text-sm text-red-500">
						このユーザーIDは使用できません。
					</p>
				)}
				{!isPending && !isDuplicate && value && !errors.userId && (
					<p className="text-sm text-green-500">
						このユーザーIDは利用可能です。
					</p>
				)}
				{serverErrorMessage && (
					<p className="text-sm text-red-500">{serverErrorMessage}</p>
				)}
			</div>

			<Button
				type="submit"
				disabled={!value}
				className="cursor-pointer border-background-light-2 hover:bg-background-light-1 text-foreground-dark-2"
				variant={"outline"}
			>
				登録
			</Button>
		</form>
	);
}
