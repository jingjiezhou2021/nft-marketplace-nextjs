import { cn } from '@/lib/utils';
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
export default function HighlyWeekSales({
	banner,
	cover,
	title,
	subtitle,
	description,
	samples,
	...props
}: {
	banner: string;
	cover: string;
	title: string;
	subtitle: string;
	description: string;
	samples: [
		Parameters<typeof SampleCard>[0],
		Parameters<typeof SampleCard>[0],
	];
} & React.ComponentProps<'div'>) {
	return (
		<BlurryBackground
			bg={
				<Image
					src={banner}
					fill
					alt="blurred-bg"
				></Image>
			}
			{...props}
			className={cn('cursor-pointer', props.className)}
		>
			<div className="w-full flex flex-col md:grid md:grid-cols-2 md:gap-6 dark">
				<div className="grid grid-cols-2 gap-4 md:block text-wrap w-full md:w-auto md:col-span-1">
					<div className="mb-8">
						<Image
							src={cover}
							width={92}
							height={92}
							alt="avatar"
							className="mb-6"
						/>
						<h3 className="text-xl pb-4 font-bold">{title}</h3>
						<div className="text-sm font-light font-mono">
							{subtitle}
						</div>
					</div>
					<div className="text-xs font-extralight">
						<div className="leading-[1.7] line-clamp-7 md:line-clamp-4">
							{description.split('\\n').map((paragraph) => {
								return (
									<>
										<p key={paragraph}>{paragraph}</p>
										<br />
									</>
								);
							})}
						</div>
					</div>
				</div>
				<div className="mt-8 md:mt-0 md:col-span-1 flex items-center">
					<div className="grid grid-cols-2 gap-4">
						{samples.map((s) => {
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
