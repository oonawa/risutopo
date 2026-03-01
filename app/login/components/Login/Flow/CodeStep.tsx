import InputForm from "./InputForm";

type FormValue = { value: string };

type Props = {
	onSubmit: (data: FormValue) => void;
};

export default function CodeStep({ onSubmit }: Props) {
	return (
		<InputForm
			placeholder="認証コードを入力"
			onSubmit={onSubmit}
			htmlFor={"loginCode"}
			label={
				<>
					6桁の認証コードをお送りしました。
					<br />
					メールを確認してください。
				</>
			}
		/>
	);
}
