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
import useCollectionName from '@/hooks/use-collection-name';
import ProfileAvatar from '@/components/profile/avatar';
import Link from 'next/link';
import findCollection from '@/lib/graphql/queries/find-collection';
import { QueryMode } from '@/apollo/gql/graphql';
import { useAccount } from 'wagmi';
import CryptoPrice from '@/components/crypto-price';
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
	const { name: collectionName } = useCollectionName(address, chainId);
	const { data: collectionData } = useQuery(findCollection, {
		variables: {
			where: {
				address: {
					equals: address,
					mode: QueryMode.Insensitive,
				},
				chainId: {
					equals: chainId,
				},
			},
		},
	});
	const { t } = useTranslation('common');
	const { data: nftData } = useQuery(findNFT, {
		fetchPolicy: 'network-only', // Used for first execution
		nextFetchPolicy: 'cache-first', // Used for subsequent executions
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
	const { dispName: ownerDispName, user: owner } = useUser(
		nftData?.findFirstNFT?.user.address,
	);
	const { address: userAddress } = useAccount();
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
				<div className="text-sm text-muted-foreground flex gap-2">
					<Link
						href={`/nft/${chainId}/${address}`}
						locale={_props._nextI18Next?.initialLocale}
						className="flex text-foreground hover:text-primary"
					>
						<ProfileAvatar
							avatar={collectionData?.findFirstCollection?.avatar}
							address={address}
							className="size-6 mr-2"
							size={12}
						/>
						{collectionName}
					</Link>
					<Separator
						orientation="vertical"
						className="h-auto!"
					/>
					{t('Owned by')}&nbsp;
					{ownerDispName}
				</div>

				<div className="flex items-center gap-1">
					<Badge variant="outline">
						{getIconOfChain(chainId)}&nbsp;
						{getNameOfChain(chainId)}
					</Badge>
					<Badge variant="outline">
						{t('TOKEN')}&nbsp;#{tokenId}
					</Badge>
				</div>

				<div className="border rounded-lg bg-card p-4 flex flex-col gap-2">
					<div className="flex flex-wrap items-center gap-4">
						<div className="flex flex-col">
							<span className="text-xs text-muted-foreground">
								{t('Collection Floor')}
							</span>
							<span className="font-semibold">-</span>
						</div>
						<div className="flex flex-col">
							<span className="text-xs text-muted-foreground">
								{t('Top Offer')}
							</span>
							<span className="font-semibold">-</span>
						</div>
						<div className="flex flex-col">
							<span className="text-xs text-muted-foreground">
								{t('Last Sale')}
							</span>
							<span className="font-semibold">-</span>
						</div>
					</div>
					<Separator orientation="horizontal" />
					{chainId !== undefined &&
						nftData?.findFirstNFT?.activeItem && (
							<div className="flex">
								<div className="flex flex-col gap-1">
									<h4 className="text-muted-foreground text-xs">
										{t('Price')}&nbsp;
									</h4>
									<CryptoPrice
										chainId={chainId}
										{...nftData.findFirstNFT.activeItem
											.listing}
									/>
								</div>
							</div>
						)}
					<Separator orientation="horizontal" />
					<div>
						{userAddress?.toLowerCase() ===
						owner?.address.toLowerCase() ? (
							<Link
								className="w-full"
								href={`/nft/${chainId}/${address}/${tokenId}/list-item`}
								locale={_props._nextI18Next?.initialLocale}
							>
								{nftData?.findFirstNFT?.activeItem ? (
									<Button
										className="w-full"
										variant="destructive"
									>
										{t('Cancel Listing')}
									</Button>
								) : (
									<Button className="w-full">
										{t('List Item')}
									</Button>
								)}
							</Link>
						) : (
							<div className="flex justify-between">
								<Button className="w-[48%]">
									{t('Buy Now')}
								</Button>
								<Button className="w-[48%]">
									{t('Make Offer')}
								</Button>
							</div>
						)}
					</div>
				</div>

				<Separator />

				{/* Tabs Section */}
				<Tabs
					defaultValue="traits"
					className="w-full"
				>
					<TabsList className="flex flex-wrap w-full h-auto">
						<CustomTabsTrigger
							value="traits"
							className="hover:cursor-pointer hover:text-primary dark:hover:text-primary"
						>
							{t('Traits')}
						</CustomTabsTrigger>
						<CustomTabsTrigger
							value="about"
							className="hover:cursor-pointer hover:text-primary dark:hover:text-primary"
						>
							{t('About')}
						</CustomTabsTrigger>
						<CustomTabsTrigger
							value="more"
							className="hover:cursor-pointer hover:text-primary dark:hover:text-primary"
						>
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
