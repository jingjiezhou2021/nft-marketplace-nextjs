import Image from 'next/image';
import CarouselScroller from './carousel-scroller';
import { ReactNode } from 'react';
import { CarouselItem } from './ui/carousel';
import { cn } from '@/lib/utils';
import { Card, CardContent } from './ui/card';

interface PropsType {
	contents: {
		image: string;
		title?: ReactNode;
		subtitle?: ReactNode;
		caption?: ReactNode;
	}[];
	shadow?: boolean;
	loop?: boolean;
}
export default function CarouselImageScroller(props: PropsType) {
	return (
		<CarouselScroller
			loop={props.loop}
			contents={props.contents.map((c, index) => {
				return (
					<>
						<Card className="h-full p-0 border-0 rounded-xl overflow-hidden hover:-translate-y-0.5 hover:scale-[1.01] active:scale-[1.005] duration-200 ease-out-circ transition">
							<CardContent className="flex items-center justify-center h-full p-0 relative">
								<Image
									src={c.image}
									fill
									alt="carousel-image-scroll-item"
								/>
								<div className="absolute w-full bottom-0 p-3 z-10 text-sm">
									<div className="text-primary-foreground">
										{c.title}
									</div>
									<div className="text-muted-foreground">
										{c.subtitle}
									</div>
								</div>
								{props.shadow && (
									<div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)0%,rgba(0,0,0,0.35)25%,rgba(0,0,0,0.65)65%,rgba(0,0,0,0.8)100%)]"></div>
								)}
							</CardContent>
						</Card>
						<div className="absolute -bottom-8 font-bold left-0 text-foreground">
							<span className="text-sm">{c.caption}</span>
						</div>
					</>
				);
			})}
		/>
	);
}
