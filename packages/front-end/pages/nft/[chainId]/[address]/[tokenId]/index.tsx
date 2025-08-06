import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { SSRConfig, useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetServerSideProps, InferGetStaticPropsType } from 'next';
import { useRouter } from 'next/router';
import findNFT from '@/lib/graphql/queries/find-nft';
import { Badge } from '@/components/ui/badge';
import { getIconOfChain, getNameOfChain } from '@/lib/chain';
import NFTDetailAbout from '@/components/nft/detail/about';
import useUser from '@/hooks/use-user';
import { useQuery } from '@apollo/client';
import { useParams } from 'next/navigation';
import useNFTMetadata from '@/hooks/use-nft-metadata';
import NFTDetailTraits from '@/components/nft/detail/traits';
import { ChainIdParameter } from '@wagmi/core/internal';
import { config } from '@/components/providers/RainbowKitAllProvider';
import NFTDetailMore from '@/components/nft/detail/more';
export const getServerSideProps: GetServerSideProps<SSRConfig> = async ({
	locale,
}) => {
	return {
		props: {
			...(await serverSideTranslations(locale!, ['common'])),
			// Will be passed to the page component as props
		},
	};
};
function CustomTabsTrigger({
	value,
	className,
	children,
}: React.ComponentProps<typeof TabsTrigger>) {
	return (
		<TabsTrigger
			className={cn(
				'py-2 data-[state=active]:bg-primary! text-muted-foreground  data-[state=active]:text-primary-foreground',
				className,
			)}
			value={value}
		>
			{children}
		</TabsTrigger>
	);
}
export default function NFTDetailPage(
	_props: Awaited<InferGetStaticPropsType<typeof getServerSideProps>>,
) {
	const params = useParams<{
		chainId: string;
		address: `0x${string}`;
		tokenId: string;
	}>();
	const chainId = parseInt(params.chainId) as ChainIdParameter<
		typeof config
	>['chainId'];
	const address = params.address;
	const tokenId = parseInt(params.tokenId);
	const { t } = useTranslation('common');
	const { data: nftData } = useQuery(findNFT, {
		variables: {
			where: {
				contractAddress: {
					equals: address,
				},
				tokenId: {
					equals: tokenId,
				},
				collection: {
					is: {
						chainId: {
							equals: chainId,
						},
					},
				},
			},
		},
	});
	const { metadata: nftMetadata } = useNFTMetadata(address, tokenId, chainId);
	const dispName = nftMetadata?.name ?? `# ${tokenId}`;
	const { dispName: ownerDispName } = useUser(
		nftData?.findFirstNFT?.user.address,
	);
	return (
		<div className="flex flex-col lg:flex-row gap-6 p-4 lg:py-6 lg:pl-2 h-full">
			{/* Left Side: NFT Image */}
			<div className="h-full aspect-square shrink-0">
				<Card className="h-full overflow-hidden rounded-2xl shadow-lg p-0">
					<CardContent className="p-0 relative h-full">
						<Image
							src={nftMetadata?.image!} // Replace with actual NFT image URL
							alt="NFT Image"
							fill
							className="h-full w-auto object-cover"
						/>
					</CardContent>
				</Card>
			</div>

			{/* Right Side: Details */}
			<div className="flex-1 space-y-4 lg:h-full lg:overflow-auto">
				{/* Title */}
				<h1 className="text-2xl font-bold">{dispName}</h1>
				<p className="text-sm text-muted-foreground">
					{t('Owned by')}&nbsp;
					{ownerDispName}
				</p>

				<div className="flex items-center gap-1">
					<Badge variant="outline">
						{getIconOfChain(chainId)}&nbsp;
						{getNameOfChain(chainId)}
					</Badge>
					<Badge variant="outline">
						{t('TOKEN')}&nbsp;#{tokenId}
					</Badge>
				</div>

				{/* Pricing Section */}
				<div className="flex flex-wrap items-center gap-4 p-4 border rounded-lg bg-card">
					<div className="flex flex-col">
						<span className="text-xs text-muted-foreground">
							{t('Collection Floor')}
						</span>
						<span className="font-semibold">-</span>
					</div>
					<div className="flex flex-col">
						<span className="text-xs text-muted-foreground">
							{t('Last Sale')}
						</span>
						<span className="font-semibold">-</span>
					</div>
					<Button className="ml-auto">{t('Make Offer')}</Button>
				</div>

				<Separator />

				{/* Tabs Section */}
				<Tabs
					defaultValue="traits"
					className="w-full"
				>
					<TabsList className="flex flex-wrap w-full h-auto">
						<CustomTabsTrigger value="traits">
							{t('Traits')}
						</CustomTabsTrigger>
						<CustomTabsTrigger value="about">
							{t('About')}
						</CustomTabsTrigger>
						<CustomTabsTrigger value="more">
							{t('More')}
						</CustomTabsTrigger>
					</TabsList>

					<TabsContent
						value="traits"
						className="p-4 border rounded-lg"
					>
						<NFTDetailTraits
							{...{
								contractAddress: address,
								tokenId: tokenId,
								chainId: chainId,
							}}
						/>
					</TabsContent>
					<TabsContent
						value="about"
						className="p-4 border rounded-lg"
					>
						<NFTDetailAbout
							contractAddress={address}
							tokenId={tokenId}
							chainId={chainId}
						/>
					</TabsContent>
					<TabsContent
						value="more"
						className="p-4 border rounded-lg"
					>
						<NFTDetailMore
							contractAddress={address}
							tokenId={tokenId}
							chainId={chainId}
						/>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
