import {
	Html,
	Head,
	Body,
	Container,
	Heading,
	Text,
	Link,
} from "@react-email/components";

type Props = {
	loginCode: string;
	url: string;
};

export default function LoginMailTemplate({ loginCode, url }: Props) {
	return (
		<Html lang="ja">
			<Head>
				<meta name="color-scheme" content="dark" />
				<meta name="supported-color-schemes" content="dark" />
			</Head>
			<Body
				style={{
					color: "#ecf2f1",
					backgroundColor: "#212f2c",
					width: "100%",
					margin: 0,
				}}
			>
				<Container
					style={{
						width: "100%",
						marginLeft: "auto",
						marginRight: "auto",
						paddingLeft: "8px",
						paddingRight: "8px",
					}}
				>
					<Container
						style={{
							width: "100%",
							marginLeft: "auto",
							marginRight: "auto",
						}}
					>
						<Heading
							style={{
								fontSize: "24px",
								fontWeight: 700,
								marginTop: "40px",
							}}
						>
							ログインコード
						</Heading>

						<Text>
							こちらのコードを入力してください。
							<Link
								href={url}
								target="_blank"
								rel="noopener nofollow"
								style={{
									color: "#c9d9d5",
									textDecoration: "underline",
								}}
							>
								{url}
							</Link>
						</Text>

						<Container
							style={{
								width: "100%",
								borderRadius: "8px",
								paddingTop: "16px",
								paddingBottom: "16px",
								textAlign: "center",
								background: "#304c44",
							}}
						>
							<Text
								style={{
									fontSize: "20px",
								}}
							>
								{loginCode}
							</Text>
						</Container>

						<Container
							style={{
								marginTop: "16px",
								marginBottom: "40px",
								textAlign: "center",
							}}
						>
							<Text
								style={{
									fontSize: "14px",
									color: "#acc3bd",
								}}
							>
								身に覚えのない方は、このメールを削除してください。
							</Text>
						</Container>
					</Container>
				</Container>
			</Body>
		</Html>
	);
}
