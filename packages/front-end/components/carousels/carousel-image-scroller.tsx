import Image from 'next/image';
import { ReactNode } from 'react';
import { CarouselItem } from '../ui/carousel';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '../ui/card';

export function CarouselImageScrollerItem({
	content,
	inZone,
	shadow,
}: {
	content: {
		image: string;
		title?: ReactNode;
		subtitle?: ReactNode;
		caption?: ReactNode;
	};
	inZone: boolean;
	shadow?: boolean;
}) {
	return (
		<CarouselItem
			className={cn(
				'pl-0 basis-[calc(100%-76px)] lg:basis-[315px] aspect-3/2 mr-3 md:mr-4 transition-opacity ease-in-out duration-200 relative cursor-pointer',
				!inZone && 'opacity-20',
			)}
		>
			<Card className="h-full p-0 border-0 rounded-xl overflow-hidden hover:-translate-y-0.5 hover:scale-[1.01] active:scale-[1.005] duration-200 ease-out-circ transition">
				<CardContent className="flex items-center justify-center h-full p-0 relative">
					<Image
						src={content.image}
						fill
						alt="carousel-image-scroll-item"
					/>
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
				</CardContent>
			</Card>
			<div className="absolute -bottom-8 font-bold left-0 text-foreground">
				<span className="text-sm">{content.caption}</span>
			</div>
		</CarouselItem>
	);
}
