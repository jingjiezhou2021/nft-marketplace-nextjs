import { ReactNode } from 'react';

export default function TitleWrapper({
	children,
	title,
	subtitle,
}: {
	children: ReactNode;
	title: string;
	subtitle?: string;
}) {
	return (
		<div>
			<h2 className="text-2xl font-bold mb-2 mt-4">{title}</h2>
			<h5 className="text-muted-foreground text-sm">{subtitle}</h5>
			{children}
		</div>
	);
}
