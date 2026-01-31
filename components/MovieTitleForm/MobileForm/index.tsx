type Props = {
	userAgent: string;
};

export default function MobileForm({ userAgent }: Props) {
	return (
        <div>
            <h2>モバイルで見てるんですね！</h2>
            <p>{userAgent}</p>
        </div>
    );
}
