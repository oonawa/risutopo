import UserMovieList from "./components/List";

type Props = {
	params: Promise<{
		publicListId: string;
	}>;
};

export default async function MovieList({ params }: Props) {
	const { publicListId } = await params;

	return <UserMovieList publicListId={publicListId} />;
}
