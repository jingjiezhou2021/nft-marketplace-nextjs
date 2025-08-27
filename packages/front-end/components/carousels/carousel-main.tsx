import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardContent } from '../ui/card';
import Autoplay from 'embla-carousel-autoplay';
import { type CarouselApi } from '@/components/ui/carousel';
import {
	ReactElement,
	ReactNode,
	useCallback,
	useEffect,
	useState,
} from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export function CarouselMainItem({
	children,
	className,
	link,
	...props
}: { children: ReactNode; link: string } & React.ComponentProps<
	typeof CarouselItem
>) {
	const { i18n } = useTranslation('common');
	return (
		<CarouselItem
			className={cn('pl-0', className)}
			{...props}
		>
			<Card className="h-full p-0 border-0">
				<CardContent className="p-0 h-full">
					<Link
						href={link}
						locale={i18n.language}
						className="flex items-center relative justify-center h-full"
					>
						{children}
						<div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)0%,rgba(0,0,0,0.35)25%,rgba(0,0,0,0.65)65%,rgba(0,0,0,0.8)100%)]"></div>
					</Link>
				</CardContent>
			</Card>
		</CarouselItem>
	);
}

export default function CarouselMain({
	children,
	count,
}: {
	children: ReactNode;
	count: number;
}) {
	const [api, setApi] = useState<CarouselApi>();
	const scrollTo = useCallback(
		(index: number) => {
			if (index === api?.selectedScrollSnap()) return;
			const autoplay = api?.plugins()?.autoplay;
			autoplay?.reset();
			api?.scrollTo(index);
		},
		[api],
	);
	const [current, setCurrent] = useState(0);
	useEffect(() => {
		if (!api) {
			return;
		}
		setCurrent(api.selectedScrollSnap());

		api.on('select', () => {
			setCurrent(api.selectedScrollSnap());
		});
	}, [api]);
	return (
		<div>
			<Carousel
				setApi={setApi}
				className="w-full carousel group rounded-xl overflow-hidden mt-4"
				opts={{
					loop: true,
				}}
				plugins={[
					Autoplay({
						delay: 5000,
						stopOnInteraction: false,
					}),
					WheelGesturesPlugin(),
				]}
			>
				<CarouselContent className="aspect-6/7 sm:aspect-4/3 md:aspect-16/9 xl:h-[400px] w-full relative ml-0">
					{children}
				</CarouselContent>
				<div
					onClick={() => {
						api?.plugins().autoplay.reset();
					}}
					className="hidden sm:block"
				>
					<CarouselPrevious className="size-12 text-primary left-2 opacity-0 disabled:opacity-0 -translate-x-2 group-hover:translate-x-0 group-hover:opacity-80 group-hover:disabled:opacity-50 transition ease-in-out hover:scale-[1.03] hover:text-fuchsia-500 active:scale-[1.05]">
						<ChevronLeft className="size-6" />
					</CarouselPrevious>
				</div>
				<div
					onClick={() => {
						api?.plugins().autoplay.reset();
					}}
					className="hidden sm:block"
				>
					<CarouselNext className="size-12 text-primary right-2 opacity-0 disabled:opacity-0 translate-x-2 group-hover:translate-x-0 group-hover:opacity-80 group-hover:disabled:opacity-50 transition ease-in-out hover:scale-[1.03] hover:text-fuchsia-500 active:scale-[1.05]">
						<ChevronRight className="size-6" />
					</CarouselNext>
				</div>
			</Carousel>
			<div className="flex gap-2 justify-center w-auto pt-4">
				{new Array(count).fill(0).map((item, index) => {
					return (
						<div
							className={cn(
								'h-1.5 grow lg:grow-0 lg:w-10 bg-neutral-200 rounded transition duration-500 cursor-pointer',
								index === current && 'bg-primary',
							)}
							key={index}
							onClick={() => {
								scrollTo(index);
							}}
						></div>
					);
				})}
			</div>
		</div>
	);
}
