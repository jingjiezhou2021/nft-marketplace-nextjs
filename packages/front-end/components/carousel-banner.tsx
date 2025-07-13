import Image from 'next/image';
import CarouselMain from './carousel-main';
import { Separator } from './ui/separator';
import { ShieldCheck, ShieldQuestionMark } from 'lucide-react';

interface PropsType {
	nftBanners: {
		banner: string;
		nftExamples: [string, string, string];
	}[];
}
export default function CarouselBanner(props: PropsType) {
	return (
		<CarouselMain
			contents={props.nftBanners.map((nb, index) => {
				return (
					<div
						key={index}
						className="relative size-full"
					>
						<Image
							src={nb.banner}
							fill
							alt="nft-banner"
						/>
						<div className="absolute left-4 bottom-4 text-white z-10">
							<div className="flex gap-2 items-center">
								<h1 className="text-4xl">Creatures</h1>
								<ShieldCheck className="fill-primary" />
							</div>
							<div className="flex gap-2 items-center text-sm mt-2">
								<h2>By CreatureWorld</h2>
								<ShieldQuestionMark
									className="fill-gray-500"
									size={14}
								/>
							</div>
							<div className="text-xs flex gap-4 px-4 py-3 bg-(--color-frosted) mt-3 rounded-xl border border-(--color-frosted)">
								{[
									['FLOOR PRICE', '0.0213 ETH'],
									['ITEMS', '9,999'],
									['TOTAL VOLUMN', '36.5K ETH'],
									['LISTED', '1%'],
								].map((item, index) => {
									return (
										<>
											<div key={index}>
												<div className="text-muted-foreground mb-2">
													{item[0]}
												</div>
												<div className="text-sm">
													{item[1]}
												</div>
											</div>
											{index < 3 && (
												<Separator
													orientation="vertical"
													className="h-auto! bg-(--color-frosted)"
												/>
											)}
										</>
									);
								})}
							</div>
						</div>
						<div className="absolute right-4 bottom-4 z-10 flex gap-2">
							{nb.nftExamples.map((e) => {
								return (
									<Image
										key={e}
										src={e}
										width={80}
										height={80}
										alt="nft-banner-example"
										className="rounded-lg"
									/>
								);
							})}
						</div>
					</div>
				);
			})}
		/>
	);
}
