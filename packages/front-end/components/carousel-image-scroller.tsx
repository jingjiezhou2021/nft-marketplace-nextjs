import Image from 'next/image';
import CarouselScroller from './carousel-scroller';
import { ReactNode } from 'react';

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
			shadow={props.shadow}
			loop={props.loop}
			contents={props.contents.map((c) => {
				return {
					content: (
						<>
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
						</>
					),
					caption: <span className="text-sm">{c.caption}</span>,
				};
			})}
		/>
	);
}
