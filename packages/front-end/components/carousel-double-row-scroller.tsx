import { ReactNode } from 'react';
import CarouselScroller from './carousel-scroller';
import { cn } from '@/lib/utils';
import { CarouselItem } from './ui/carousel';
export default function CarouselDoubleRowScoller(props: {
	twins: [ReactNode, ReactNode][];
}) {
	return (
		<CarouselScroller
			contents={props.twins.map((t, index) => {
				return {
					render(inZone) {
						return (
							<CarouselItem
								key={index}
								className={cn(
									'pl-0 basis-[315px] aspect-3/2 mr-3 md:mr-4 transition-opacity ease-in-out duration-200 relative cursor-pointer',
									!inZone && 'opacity-20',
								)}
							>
								<div
									className="h-full flex flex-col gap-3"
									key={index}
								>
									{t[0]}
									{t[1]}
								</div>
							</CarouselItem>
						);
					},
				};
			})}
		/>
	);
}
