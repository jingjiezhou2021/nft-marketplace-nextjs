import { ReactNode } from 'react';
import CarouselDoubleRowScoller from './carousel-double-row-scroller';
import Image from 'next/image';
interface TwinData {
	cover: string;
	title: string;
	description: string | ReactNode;
}
export default function CarouselDoubleRowItemsScoller(props: {
	twinDatas: [TwinData, TwinData][];
}) {
	return (
		<CarouselDoubleRowScoller
			twins={props.twinDatas.map((twin, index) => {
				return twin.map((td) => {
					return (
						<div
							className="grow flex  hover:-translate-y-0.5 hover:scale-[1.01] active:scale-[1.005] duration-200 ease-out-circ transition items-center"
							key={td.title}
						>
							<Image
								src={td.cover}
								alt={td.title}
								width={80}
								height={80}
								className="size-[80px] rounded-xl overflow-hidden"
							/>
							<div className="grow ml-2">
								<div className="text-sm">
									<h3 className="font-bold mb-1">
										{td.title}
									</h3>
									<p className="font-mono text-muted-foreground">
										{td.description}
									</p>
								</div>
							</div>
						</div>
					);
				}) as [ReactNode, ReactNode];
			})}
		/>
	);
}
