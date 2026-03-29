import {
	Html,
	Head,
	Body,
	Container,
	Heading,
	Text,
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
					color: "#3f4443",
					backgroundColor: "#b0c8c3",
					margin: 0,
					padding: 20,
				}}
			>
				<Container
					style={{
						width: "100%",
						maxWidth: 500,
						height: "100%",
						marginLeft: "auto",
						marginRight: "auto",
						backgroundColor: "#fff",
						borderRadius: 20,
						padding: 20,
					}}
				>
					<Container
						style={{
							width: "100%",
							marginLeft: "auto",
							marginRight: "auto",
							marginTop: 20,
						}}
					>
						<Container
							style={{
								marginLeft: "auto",
								marginRight: "auto",
								width: 80,
								height: 80,
							}}
						>
							<img src={`${url}/logo.png`} alt="" />
						</Container>
						<Heading
							style={{
								fontSize: "24px",
								textAlign: "center",
								fontWeight: 700,
							}}
						>
							りすとぽっと
						</Heading>

						<Text style={{ marginTop: 20, marginBottom: 0 }}>
							元の画面でこちらを入力してください。
						</Text>

						<Container
							style={{
								width: "100%",
								borderRadius: "8px",
								textAlign: "center",
								background: "#c5dbd7",
								marginLeft: "auto",
								marginRight: "auto",
								marginTop: 20,
							}}
						>
							<Text
								style={{
									fontSize: "20px",
									fontWeight: "bold",
								}}
							>
								{loginCode}
							</Text>
						</Container>

						<Container
							style={{
								marginTop: 10,
							}}
						>
							<Text style={{ marginTop: 10, marginBottom: 0 }}>
								コードは発行から<strong>10分間</strong>有効です。
							</Text>
							<Text style={{ marginTop: 0, marginBottom: 0 }}>
								期限が切れてしまったら発行し直してください。
							</Text>
						</Container>

						<Container
							style={{
								marginTop: "30px",
								marginBottom: "30px",
							}}
						>
							<Text
								style={{
									fontSize: "12px",
									color: "#606b69",
								}}
							>
								※身に覚えのない方は、このメールを削除してください。
							</Text>
						</Container>
					</Container>
				</Container>
			</Body>
		</Html>
	);
}
