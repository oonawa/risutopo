type Props = {
	userAgent: string;
};

export default function PcForm({ userAgent }: Props) {
	return (
		<div>
            <h2>PCで見てるんですね！</h2>
			<p>{userAgent}</p>
		</div>
	);
}
