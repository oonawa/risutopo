export default function Container({ children }: { children: React.ReactNode }) {
	return (
		<div className="w-full max-w-6xl mx-auto">
			<div className="flex flex-wrap justify-start pl-0 sm:pl-5">
				{children}
			</div>
		</div>
	);
}
