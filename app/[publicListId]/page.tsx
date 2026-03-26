import { notFound } from "next/navigation";
import { currentUserId } from "@/features/shared/actions/currentUserId";
import { getUserMovieList } from "@/features/list/actions/getUserMovieList";
import LocalList from "./components/LocalList";
import List from "./components/List";

type Props = {
	params: Promise<{
		publicListId: string;
	}>;
};

export default async function ListPage({ params }: Props) {
	const { publicListId } = await params;

	const result = await currentUserId();

	if (!result.success) {
		return <LocalList publicListId={publicListId} />;
	}

	const moviesResult = await getUserMovieList(publicListId, result.data.userId);

	if (!moviesResult.success) {
		if (
			moviesResult.error.code === "FORBIDDEN_ERROR" ||
			moviesResult.error.code === "NOT_FOUND_ERROR"
		) {
			return notFound();
		}

		throw new Error(moviesResult.error.message);
	}

	const items = moviesResult.data;

	return <List publicListId={publicListId} items={items} />;
}
