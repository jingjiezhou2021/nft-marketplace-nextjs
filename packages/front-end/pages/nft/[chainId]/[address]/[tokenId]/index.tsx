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
import useUser from '@/lib/hooks/use-user';
import { useQuery } from '@apollo/client';
import { redirect, useParams } from 'next/navigation';
import useNFTMetadata from '@/lib/hooks/use-nft-metadata';
import NFTDetailTraits from '@/components/nft/detail/traits';
import { ChainIdParameter } from '@wagmi/core/internal';
import { config } from '@/components/providers/RainbowKitAllProvider';
import NFTDetailMore from '@/components/nft/detail/more';
import useCollectionName from '@/lib/hooks/use-collection-name';
import ProfileAvatar from '@/components/profile/avatar';
import Link from 'next/link';
import findCollection from '@/lib/graphql/queries/find-collection';
import { QueryMode } from '@/apollo/gql/graphql';
import { useAccount, useWaitForTransactionReceipt } from 'wagmi';
import CryptoPrice from '@/components/crypto-price';
import checkOwnerShip from '@/lib/nft/check-ownership';
import { useWriteNftMarketplaceCancelListing } from 'smart-contract/wagmi/generated';
import MARKETPLACE_ADDRESS from '@/lib/market';
import { LoadingMask, LoadingSpinner } from '@/components/loading';
import { useEffect } from 'react';
import useMessage from 'antd/es/message/useMessage';
import TransferNFTDialog from '@/components/nft/dialog/transfer';
import UpdateListingDialog from '@/components/nft/dialog/update-listing';
import { CheckoutDrawer } from '@/components/nft/detail/checkout';
import MakeOfferDrawer from '@/components/nft/detail/make-offer';
import NFTDetailOffers from '@/components/nft/detail/offers';
import ChainBadge from '@/components/chain-badge';
export const getServerSideProps: GetServerSideProps<
	SSRConfig,
	{ chainId: string; address: `0x${string}`; tokenId: string }
> = async ({ params, locale, resolvedUrl }) => {
	if (params) {
		const { refresh } = await checkOwnerShip(
			params.chainId,
			params.address,
			params.tokenId,
		);
		console.log('refresh:', refresh);
		if (refresh) {
			if (locale) {
				resolvedUrl = `/${locale}${resolvedUrl}`;
			}
			console.log('resolved url:', resolvedUrl);
			return {
				redirect: {
					destination: resolvedUrl,
					permanent: false,
				},
			};
		}
	}
	return {
		props: {
			...(await serverSideTranslations(locale!, ['common', 'offer'])),
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
	const [messageApi, contextHolder] = useMessage();
	const router = useRouter();
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
	const {
		writeContract: writeCancelListing,
		isPending: cancelListingPending,
		data: cancelListingHash,
	} = useWriteNftMarketplaceCancelListing();
	const {
		isLoading: cancelListingConfirming,
		isSuccess: cancelListingConfirmed,
		isError: cancelListingErrorEncountered,
		error: cancelListingError,
	} = useWaitForTransactionReceipt({
		hash: cancelListingHash,
	});
	const dispName = nftMetadata?.name ?? `# ${tokenId}`;
	const { dispName: ownerDispName, user: owner } = useUser(
		nftData?.findFirstNFT?.user.address,
	);
	const { address: userAddress } = useAccount();
	useEffect(() => {
		if (cancelListingConfirmed) {
			messageApi.success(t('Cancel Listing item successful'));
			router.reload();
		}
		if (cancelListingErrorEncountered) {
			messageApi.error(t('Cancel Listing item failed'));
			console.error(cancelListingError);
		}
	}, [cancelListingConfirmed, cancelListingErrorEncountered]);
	return (
		<div className="flex flex-col lg:flex-row gap-6 p-4 lg:py-6 lg:pl-2 h-full relative">
			{contextHolder}
			<LoadingMask
				loading={cancelListingConfirming || cancelListingPending}
				className="flex justify-center items-center"
			>
				<LoadingSpinner size={48} />
			</LoadingMask>
			{/* Left Side: NFT Image */}
			<div className="h-full aspect-square shrink-0">
				<Card className="h-full overflow-hidden rounded-2xl shadow-lg p-0">
					<CardContent className="p-0 relative h-full">
						<Image
							src={nftMetadata?.image ?? '/nft-placeholder.svg'} // Replace with actual NFT image URL
							unoptimized
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
					<ChainBadge chainId={chainId} />
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
							<>
								<div className="flex w-full">
									<div className="flex flex-col gap-1 w-full">
										<h4 className="text-muted-foreground text-xs">
											{t('Price')}&nbsp;
										</h4>
										<div className="flex justify-between w-full items-center">
											<CryptoPrice
												chainId={chainId}
												{...nftData.findFirstNFT
													.activeItem.listing}
											/>
											{userAddress?.toLowerCase() ===
												owner?.address.toLowerCase() && (
												<UpdateListingDialog
													nft={{
														contractAddress:
															address,
														chainId,
														tokenId,
													}}
												>
													<Button
														variant={'secondary'}
													>
														{t('Edit')}
													</Button>
												</UpdateListingDialog>
											)}
										</div>
									</div>
								</div>
								<Separator orientation="horizontal" />
							</>
						)}
					<div className="flex justify-between">
						{userAddress?.toLowerCase() ===
						owner?.address.toLowerCase() ? (
							<>
								{chainId &&
								nftData?.findFirstNFT?.activeItem ? (
									<Button
										className="w-[48%]"
										variant="destructive"
										disabled={
											cancelListingConfirming ||
											cancelListingPending
										}
										onClick={() => {
											writeCancelListing({
												address: MARKETPLACE_ADDRESS[
													chainId
												] as `0x${string}`,
												chainId,
												args: [
													address,
													BigInt(tokenId),
												],
											});
										}}
									>
										{t('Cancel Listing')}
									</Button>
								) : (
									<Link
										className="w-[48%]"
										href={`/nft/${chainId}/${address}/${tokenId}/list-item`}
										locale={
											_props._nextI18Next?.initialLocale
										}
									>
										<Button className="w-full">
											{t('List Item')}
										</Button>
									</Link>
								)}
								{nftData?.findFirstNFT && (
									<TransferNFTDialog
										nft={{
											contractAddress: address,
											chainId,
											tokenId,
										}}
									>
										<Button className="w-[48%]">
											{t('Transfer')}
										</Button>
									</TransferNFTDialog>
								)}
							</>
						) : (
							<>
								{nftData?.findFirstNFT?.activeItem && (
									<CheckoutDrawer
										nfts={[
											{
												contractAddress: address,
												chainId,
												tokenId,
											},
										]}
										chainId={chainId}
									>
										<Button className="w-[48%]">
											{t('Buy Now')}
										</Button>
									</CheckoutDrawer>
								)}
								<MakeOfferDrawer
									nft={{
										contractAddress: address,
										chainId,
										tokenId,
									}}
									chainId={chainId}
								>
									<Button
										className={cn(
											nftData?.findFirstNFT?.activeItem
												? 'w-[48%]'
												: 'w-full',
										)}
									>
										{t('Make Offer')}
									</Button>
								</MakeOfferDrawer>
							</>
						)}
					</div>
					<Separator orientation="horizontal" />
					<h3>{t('Offers')}</h3>
					<p className="text-xs text-muted-foreground">
						{t('You can click the offer item to view the detail')}
					</p>
					<NFTDetailOffers
						contractAddress={address}
						tokenId={tokenId}
						chainId={chainId}
					/>
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
