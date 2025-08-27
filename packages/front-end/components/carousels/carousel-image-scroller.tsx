import Image from 'next/image';
import { ReactElement, ReactNode } from 'react';
import { CarouselItem } from '../ui/carousel';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '../ui/card';
import { LoadingMask, LoadingSpinner } from '../loading';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';

export function CarouselImageScrollerItem({
	content,
	inZone,
	shadow,
	loading,
	link,
}: {
	content: {
		image: string | ReactElement;
		title?: ReactNode;
		subtitle?: ReactNode;
		caption?: ReactNode;
	};
	inZone: boolean;
	shadow?: boolean;
	loading?: boolean;
	link?: string;
}) {
	debugger;
	const { i18n } = useTranslation('common');
	return (
		<CarouselItem
			className={cn(
				'pl-0 basis-[calc(100%-76px)] lg:basis-[315px] aspect-3/2 mr-3 md:mr-4 transition-opacity ease-in-out duration-200 relative cursor-pointer',
				!inZone && 'opacity-20',
			)}
		>
			<LoadingMask
				loading={!!loading}
				className="flex justify-center items-center"
			>
				<LoadingSpinner size={48} />
			</LoadingMask>
			<Card className="h-full p-0 border-0 rounded-xl overflow-hidden hover:-translate-y-0.5 hover:scale-[1.01] active:scale-[1.005] duration-200 ease-out-circ transition">
				<CardContent className="h-full p-0 relative">
					<Link
						href={link ?? '/'}
						locale={i18n.language}
						className="flex items-center justify-center "
					>
						{typeof content.image === 'string' ? (
							<Image
								src={content.image}
								fill
								alt="carousel-image-scroll-item"
								className="object-cover"
							/>
						) : (
							content.image
						)}
						<div className="absolute w-full bottom-0 p-3 z-10 text-sm">
							<div className="text-primary-foreground">
								{content.title}
							</div>
							<div className="text-muted-foreground">
								{content.subtitle}
							</div>
						</div>
						{shadow && (
							<div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)0%,rgba(0,0,0,0.35)25%,rgba(0,0,0,0.65)65%,rgba(0,0,0,0.8)100%)]"></div>
						)}
					</Link>
				</CardContent>
			</Card>
			<div className="absolute -bottom-8 font-bold left-0 text-foreground">
				<span className="text-sm">{content.caption}</span>
			</div>
		</CarouselItem>
	);
}
