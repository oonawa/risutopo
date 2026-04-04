import Section from "./components/Section";
import SectionTitle from "./components/Section/Title";
import HomeTutorial from "./components/HomeTutorial";
import MovieInputForm from "./components/MovieInputForm";
import Roulette from "./components/Roulette";

type Props = {
	searchParams?: Promise<{
		home?: string;
	}>;
};

export default async function HomePage({ searchParams }: Props) {
	const params = await searchParams;
	const homeWithTutorial = params?.home === "true";

	if (homeWithTutorial) {
		return (
			<HomeTutorial
				ItemRegisterForm={<MovieInputForm />}
				Roulette={<Roulette />}
			/>
		);
	}

	return (
		<>
			<Section>
				<SectionTitle>Make a List</SectionTitle>
				<MovieInputForm />
			</Section>
			<Section>
				<SectionTitle>Roulette</SectionTitle>
				<Roulette />
			</Section>
		</>
	);
}
