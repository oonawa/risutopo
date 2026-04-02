export default function Paragraph({ children }: { children: React.ReactNode }) {
	return <p className="leading-7 mt-6 not-first:mt-4">{children}</p>;
}
