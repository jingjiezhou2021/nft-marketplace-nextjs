import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Currency } from '@/lib/currency';
import { cn } from '@/lib/utils';
import Image from 'next/image';
export type NFT = {
	imageUrl: string;
	name: string;
	price: string;
	currency?: Currency;
};
export default function NFTCard({
	nft,
	className,
}: {
	nft: NFT;
	className?: string;
}) {
	return (
		<Card
			className={cn(
				'w-full py-0 rounded-lg pb-2 gap-3 cursor-pointer hover:-translate-y-0.5 hover:scale-[1.01] active:scale-[1.005] shadow-xs duration-200 ease-out-circ transition-transform',
				className,
			)}
			key={nft.name}
		>
			<CardContent className="w-full aspect-square relative">
				<Image
					src={nft.imageUrl}
					alt="nft-card"
					fill
				/>
			</CardContent>
			<CardFooter className="px-3 block">
				<h3 className="font-bold text-sm pb-2">{nft.name}</h3>
				<div>
					<p className="text-sm font-mono">
						{nft.currency === Currency.USD && '$'}
						<span>{nft.price}</span>
						{(nft.currency === Currency.ETH ||
							nft.currency === undefined) && (
							<span className="text-muted-foreground">
								&nbsp;ETH
							</span>
						)}
					</p>
				</div>
			</CardFooter>
		</Card>
	);
}
