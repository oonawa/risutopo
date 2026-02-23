import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { MovieInfo } from "@/app/types/MovieInputForm/MovieInfo";
import MovieCardDetail from "./index";

const movieWithoutDetails: MovieInfo = {
	title: "トータル・リコール",
	url: "https://video-share.unext.jp/video/title/SID0023081?utm_source=copy&utm_medium=social&utm_campaign=nonad-sns&rid=PM061312883",
	serviceSlug: "unext",
	serviceName: "U-NEXT",
};

const movieWithDetails: MovieInfo = {
	title: "トータル・リコール",
	url: "https://video-share.unext.jp/video/title/SID0023081?utm_source=copy&utm_medium=social&utm_campaign=nonad-sns&rid=PM061312883",
	serviceSlug: "unext",
	serviceName: "U-NEXT",
	details: {
		movieId: 1,
		officialTitle: "トータル・リコール",
		backgroundImage: "https://image.tmdb.org/t/p/original/uBHeAB2Ug9ELBzkMyls8CUjzn4i.jpg",
		posterImage: "https://image.tmdb.org/t/p/original/urke73YPAKt3VIdTvj50Dzl9Lnf.jpg",
		director: ["レン・ワイズマン"],
		runnningMinutes: 118,
		releaseYear: 2012,
		externalDatabaseMovieId: 64635,
		overview:
			"21世紀末の世界大戦により人類は大量の化学兵器を使用した。その結果地上の大半は居住不可能となり富裕層はヨーロッパを中心としたブリテン連邦（the United Federation of Britain、通称UFB）に住み、貧困層は反対側のオーストラリアを中心としたコロニーに居住する事になり、コロニーの住民はUFBの労働力の為にフォールと呼ばれる巨大なエレベーターに乗りUFBに通勤し働いていた。やがてUFBからの独立と解放を目的とするリーダーのマサイアスを中心としたレジスタンスと呼ばれる反体制派のテロ活動が盛んになり、UFB代表のコーヘイゲンはロボット警官のシンセティックの増産を唱える。",
	},
};

const meta = {
	title: "app/components/MovieCard/Detail/MovieCardDetail",
	component: MovieCardDetail,
	args: {
		onSearch: () => {},
		onSubmit: () => {},
		onCancel: () => {},
		isSearchPending: false,
		isSubmitPending: false,
		submitResult: undefined,
		isLoggedIn: true,
	},
	parameters: {
		layout: "centered",
	},
} satisfies Meta<typeof MovieCardDetail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithoutDetails: Story = {
	args: {
		movie: movieWithoutDetails,
		submitResult: undefined,
	},
};

export const WithDetailsIdle: Story = {
	args: {
		movie: movieWithDetails,
		submitResult: undefined,
	},
};

export const SubmitSuccessLoggedIn: Story = {
	args: {
		movie: movieWithDetails,
		submitResult: true,
		isLoggedIn: true,
	},
};

export const SubmitSuccessGuest: Story = {
	args: {
		movie: movieWithDetails,
		submitResult: true,
		isLoggedIn: false,
	},
};

export const SubmitFailed: Story = {
	args: {
		movie: movieWithDetails,
		submitResult: false,
	},
};
