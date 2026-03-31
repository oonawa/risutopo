import type { ReactNode } from "react";

type Props = {
	children: ReactNode;
	title?: string;
};

export default function VerifyFormLayout({ children, title }: Props) {
	return (
		<div className="h-[calc(100dvh-var(--header-height)-var(--navigation-height)-var(--navigation-bottom))] w-dvw flex items-center justify-center">
			<div className="flex flex-col items-center justify-center w-full max-w-150 px-4">
				{title && (
					<h1 className="w-full text-2xl font-bold mb-6">
						{title}
					</h1>
				)}
				<div className="w-full h-full flex items-center">{children}</div>
			</div>
		</div>
	);
}
