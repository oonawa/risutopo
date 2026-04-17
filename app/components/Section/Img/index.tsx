type Props = {
	src: string;
	alt: string;
};

export default function Img({ src, alt }: Props) {
	return <img src={src} alt={alt} className="my-6 rounded-lg border border-background-light-1" />;
}
