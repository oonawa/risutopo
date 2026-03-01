import InputForm from "./InputForm";

type FormValue = { value: string };

type Props = {
	onSubmit: (data: FormValue) => void;
	serverErrorMessage: string;
};

export default function EmailStep({ onSubmit, serverErrorMessage }: Props) {
	return (
		<InputForm
			serverErrorMessage={serverErrorMessage}
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
