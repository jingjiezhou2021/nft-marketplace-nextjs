import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardContent } from './ui/card';
import Autoplay from 'embla-carousel-autoplay';
import { type CarouselApi } from '@/components/ui/carousel';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures';
import { cn } from '@/lib/utils';

interface PropsType {
	contents: ReactNode[];
}
export default function CarouselScroller(props: PropsType) {
	const [api, setApi] = useState<CarouselApi>();
	const refCarousel = useRef<HTMLDivElement>(null);
	const [widthCarousel, setWidthCarousel] = useState<number>(0);
	const [scrolledDistance, setScrolledDistance] = useState<number>(0);
	const [inZone, setInZone] = useState<boolean[]>([]);
	useEffect(() => {
		const observer = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				if (mutation.attributeName === 'style') {
					const startIndex = 12;
					const tmp = (
						mutation.target as HTMLDivElement
					).style.transform.substring(startIndex);
					setScrolledDistance(Math.abs(parseFloat(tmp)));
				}
			});
		});
		const widthObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const width = entry.contentRect.width;
				setWidthCarousel(width);
			}
		});
		if (refCarousel.current) {
			observer.observe(refCarousel.current, {
				attributes: true,
				attributeFilter: ['style'],
			});
			widthObserver.observe(refCarousel.current);
		}
		return () => {
			observer.disconnect();
			widthObserver.disconnect();
		};
	}, [refCarousel]);
	useEffect(() => {
		let gap = 0;
		if (refCarousel.current.children.length > 1) {
			const [first, second] = [
				refCarousel.current.children[0],
				refCarousel.current.children[1],
			] as [HTMLDivElement, HTMLDivElement];
			gap = second.offsetLeft - (first.offsetLeft + first.offsetWidth);
		}
		const lastChild: HTMLDivElement = refCarousel.current.children[
			refCarousel.current.children.length - 1
		] as HTMLDivElement;
		const totalDistance =
			lastChild.offsetLeft + lastChild.offsetWidth + gap;
		const zone = [scrolledDistance, +scrolledDistance + widthCarousel];
		const newInzone = [...refCarousel.current.children].map(
			(c: HTMLDivElement) => {
				if (zone[1] <= totalDistance) {
					return (
						c.offsetLeft >= zone[0] &&
						c.offsetLeft + c.offsetWidth <= zone[1] % totalDistance
					);
				} else {
					return (
						(c.offsetLeft >= zone[0] &&
							c.offsetLeft + c.offsetWidth <= totalDistance) ||
						(c.offsetLeft >= 0 &&
							c.offsetLeft + c.offsetWidth <=
								zone[1] % totalDistance)
					);
				}
			},
		);
		setInZone(newInzone);
	}, [widthCarousel, scrolledDistance]);
	return (
		<div>
			<Carousel
				setApi={setApi}
				className="carousel group mt-4 overflow-hidden w-full"
				opts={{
					loop: true,
					align: 'start',
				}}
				plugins={[
					Autoplay({
						delay: 3000,
						stopOnInteraction: false,
					}),
					WheelGesturesPlugin(),
				]}
			>
				<CarouselContent
					className="w-full relative ml-0"
					ref={refCarousel}
				>
					{props.contents.map((item, index) => (
						<CarouselItem
							key={index}
							className={cn(
								'pl-0 basis-[calc(100%-76px)] lg:basis-[300px] aspect-3/2 mr-3 md:mr-4 rounded-xl overflow-hidden transition-opacity ease-in-out duration-200',
								!inZone[index] && 'opacity-20',
							)}
						>
							<Card className="h-full p-0 border-0">
								<CardContent className="flex items-center justify-center h-full p-0 relative">
									{item}
									<div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)0%,rgba(0,0,0,0.35)25%,rgba(0,0,0,0.65)65%,rgba(0,0,0,0.8)100%)]"></div>
								</CardContent>
							</Card>
						</CarouselItem>
					))}
				</CarouselContent>
				<div
					onClick={() => {
						api.plugins().autoplay.reset();
					}}
					className="hidden sm:block"
				>
					<CarouselPrevious className="size-12 text-primary left-2 opacity-0 disabled:opacity-0 -translate-x-2 group-hover:translate-x-0 group-hover:opacity-80 group-hover:disabled:opacity-50 transition ease-in-out hover:scale-[1.03] hover:text-fuchsia-500 active:scale-[1.05]">
						<ChevronLeft className="size-6" />
					</CarouselPrevious>
				</div>
				<div
					onClick={() => {
						api.plugins().autoplay.reset();
					}}
					className="hidden sm:block"
				>
					<CarouselNext className="size-12 text-primary right-2 opacity-0 disabled:opacity-0 translate-x-2 group-hover:translate-x-0 group-hover:opacity-80 group-hover:disabled:opacity-50 transition ease-in-out hover:scale-[1.03] hover:text-fuchsia-500 active:scale-[1.05]">
						<ChevronRight className="size-6" />
					</CarouselNext>
				</div>
			</Carousel>
		</div>
	);
}
