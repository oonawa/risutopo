import styles from "./Loading.module.css";

export default function Loading() {
	return (
		// biome-ignore lint/a11y/useSemanticElements: ローディングインジケーターはフォーム出力ではないため output 要素は不適切
		<div
			role="status"
			aria-label="読み込み中"
			className="w-full flex justify-center items-center py-4"
		>
			<div className={styles.loader}></div>
		</div>
	);
}
