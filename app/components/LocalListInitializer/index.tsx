"use client";

import { useEffect } from "react";
import { useEnsureLocalListId } from "@/features/list/hooks/useEnsureLocalListId";

export default function LocalListInitializer() {
	const { ensureListId } = useEnsureLocalListId();

	useEffect(() => {
		ensureListId();
	}, [ensureListId]);

	return null;
}
