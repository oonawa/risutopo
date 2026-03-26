import InputForm from "../../InputForm";

type FormValue = { value: string };

type Props = {
	onSubmit: (data: FormValue) => void;
};

export default function Email({ onSubmit }: Props) {
	return (
		<InputForm
			placeholder="メールアドレスを入力"
			onSubmit={onSubmit}
			htmlFor={"email"}
			label={
				<>
					パスワードなしでログインしましょう。
					<br />
					6桁の認証コードをメールでお送りします。
				</>
			}
		/>
	);
}
