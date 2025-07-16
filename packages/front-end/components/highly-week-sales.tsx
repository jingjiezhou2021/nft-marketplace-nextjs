import BlurryBackground from './blurry-background';
import { Card, CardContent, CardFooter } from './ui/card';
import Image from 'next/image';
function SampleCard({
	image,
	title,
	description,
}: {
	image: string;
	title: string;
	description: string;
}) {
	return (
		<Card className="pt-0 gap-2 overflow-hidden hover:-translate-y-0.5 hover:scale-[1.01] active:scale-[1.005] duration-200 ease-out-circ transition">
			<CardContent className="px-0">
				<img
					src={image}
					className="w-full"
					alt="item-card"
				/>
			</CardContent>
			<CardFooter className="block">
				<h3>{title}</h3>
				<p className="text-sm text-muted-foreground">{description}</p>
			</CardFooter>
		</Card>
	);
}
export default function HighlyWeekSales(props: {
	banner: string;
	cover: string;
	title: string;
	subtitle: string;
	description: string;
	samples: [
		Parameters<typeof SampleCard>[0],
		Parameters<typeof SampleCard>[0],
	];
}) {
	return (
		<BlurryBackground
			bg={
				<Image
					src={props.banner}
					fill
					alt="blurred-bg"
				></Image>
			}
			className="cursor-pointer"
		>
			<div className="w-full flex flex-col md:grid md:grid-cols-2 md:gap-6 dark">
				<div className="grid grid-cols-2 gap-4 md:block text-wrap w-full md:w-auto md:col-span-1">
					<div className="mb-8">
						<Image
							src={props.cover}
							width={92}
							height={92}
							alt="avatar"
							className="mb-6"
						/>
						<h3 className="text-xl pb-4 font-bold">
							{props.title}
						</h3>
						<div className="text-sm font-light font-mono">
							{props.subtitle}
						</div>
					</div>
					<div className="text-xs font-extralight">
						<p className="leading-[1.7] line-clamp-7 md:line-clamp-4">
							{props.description.split('\\n').map((paragraph) => {
								return (
									<>
										<p key={paragraph}>{paragraph}</p>
										<br />
									</>
								);
							})}
						</p>
					</div>
				</div>
				<div className="mt-8 md:mt-0 md:col-span-1 flex items-center">
					<div className="grid grid-cols-2 gap-4">
						{props.samples.map((s) => {
							return (
								<SampleCard
									{...s}
									key={s.title}
								/>
							);
						})}
					</div>
				</div>
			</div>
		</BlurryBackground>
	);
}
