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
function Wrapper<T extends React.ComponentProps<'div'>>({
	El,
	className,
}: {
	El: React.FC<T>;
	className: string;
}) {
	const WrappedFC = ({
		className: classNameInner,
		children,
		...props
	}: T) => {
		return (
			<El
				className={cn(className, classNameInner)}
				{...(props as T)}
			>
				{children}
			</El>
		);
	};
	return WrappedFC;
}
export function CardWrapper({
	children,
	className,
	...props
}: Parameters<typeof Card>[0]) {
	const Wrapped = Wrapper({
		El: Card,
		className:
			'w-full py-0 rounded-lg pb-2 gap-3 cursor-pointer hover:-translate-y-0.5 hover:scale-[1.01] active:scale-[1.005] shadow-xs duration-200 ease-out-circ transition-transform',
	});
	return (
		<Wrapped
			className={className}
			{...props}
		>
			{children}
		</Wrapped>
	);
}
export function CardContentWrapper({
	className,
	children,
	...props
}: Parameters<typeof CardContent>[0]) {
	const Wrapped = Wrapper({
		El: CardContent,
		className: 'w-full aspect-square relative',
	});
	return (
		<Wrapped
			className={className}
			{...props}
		>
			{children}
		</Wrapped>
	);
}
export function CardFooterWrapper({
	className,
	children,
	...props
}: Parameters<typeof CardFooter>[0]) {
	const Wrapped = Wrapper({
		El: CardFooter,
		className: 'px-3 block',
	});
	return (
		<Wrapped
			className={className}
			{...props}
		>
			{children}
		</Wrapped>
	);
}
export default function NFTCard({
	nft,
	className,
}: {
	nft: NFT;
	className?: string;
}) {
	return (
		<CardWrapper className={className}>
			<CardContentWrapper>
				<Image
					src={nft.imageUrl}
					alt="nft-card"
					fill
				/>
			</CardContentWrapper>
			<CardFooterWrapper>
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
			</CardFooterWrapper>
		</CardWrapper>
	);
}
