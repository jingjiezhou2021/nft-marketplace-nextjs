import { ReactElement, ReactNode } from 'react';
import Image from 'next/image';
import { LoadingMask, LoadingSpinner } from '../loading';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
interface TwinData {
	cover: string | ReactElement;
	title: string;
	description: string | ReactNode;
}

export function CarouselDoubleRowScrollerItem({
	twin,
	loading,
	link,
}: {
	twin: TwinData;
	loading?: boolean;
	link: string;
}) {
	const { i18n } = useTranslation('common');
	return (
		<Link
			className="grow flex  hover:-translate-y-0.5 hover:scale-[1.01] active:scale-[1.005] duration-200 ease-out-circ transition items-center relative"
			key={twin.title}
			locale={i18n.language}
			href={link}
		>
			<LoadingMask
				loading={!!loading}
				className="flex justify-center items-center"
			>
				<LoadingSpinner size={24} />
			</LoadingMask>
			{typeof twin.cover === 'string' ? (
				<Image
					src={twin.cover}
					alt={twin.title}
					width={80}
					height={80}
					className="size-[80px] rounded-xl overflow-hidden"
				/>
			) : (
				twin.cover
			)}
			<div className="grow ml-2">
				<div className="text-sm">
					<h3 className="font-bold mb-1">{twin.title}</h3>
					<p className="font-mono text-muted-foreground">
						{twin.description}
					</p>
				</div>
			</div>
		</Link>
	);
}
