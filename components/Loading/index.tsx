import styles from "./Loading.module.css";

export default function Loading() {
	return (
		<div className="w-full flex justify-center items-center py-4">
			<div className={styles.loader}></div>
		</div>
	);
}
