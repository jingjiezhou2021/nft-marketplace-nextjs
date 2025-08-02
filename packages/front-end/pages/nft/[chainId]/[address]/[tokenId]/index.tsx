import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { SSRConfig, useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetServerSideProps, InferGetStaticPropsType } from 'next';
import {
	getNFTCollectionCreatorAddress,
	getNFTCollectionName,
	getNFTMetadata,
} from '@/lib/nft';
import { useRouter } from 'next/router';
import createApolloClient from '@/apollo';
import findNFT from '@/lib/graphql/queries/find-nft';
import {
	FindFirstUserProfileQuery,
	FindNftQuery,
	QueryMode,
} from '@/apollo/gql/graphql';
import { getAddressAbbreviation } from '@/lib/address';
import { Badge } from '@/components/ui/badge';
import { EthereumCircleFilled } from '@ant-design/web3-icons';
import {
	getExplorerOfChain,
	getIconOfChain,
	getNameOfChain,
} from '@/lib/chain';
import findUserProfile from '@/lib/graphql/queries/find-user-profile';
import ProfileAvatar from '@/components/profile/avatar';
import Link from 'next/link';
export const getServerSideProps: GetServerSideProps<
	SSRConfig & {
		metadata: Awaited<ReturnType<typeof getNFTMetadata>>;
		metadataOffChain: FindNftQuery['findFirstNFT'];
		collectionName: string | undefined;
		collectionCreaterAddress: string | undefined;
		collectionCreator:
			| FindFirstUserProfileQuery['findFirstUserProfile']
			| undefined;
	},
	{ chainId: string; address: string; tokenId: string }
> = async ({ locale, params }) => {
	const client = createApolloClient();
	const metadata = await getNFTMetadata(
		params.address as `0x${string}`,
		parseInt(params.tokenId),
		parseInt(params.chainId) as any,
	);
	const collectionName = await getNFTCollectionName(
		params.address as `0x${string}`,
		parseInt(params.chainId) as any,
	);
	const collectionCreaterAddress = await getNFTCollectionCreatorAddress(
		params.address as `0x${string}`,
		parseInt(params.chainId) as any,
	);
	const { data } = await client.query({
		query: findNFT,
		variables: {
			where: {
				contractAddress: {
					equals: params.address,
				},
				tokenId: {
					equals: BigInt(parseInt(params.tokenId)),
				},
				collection: {
					is: {
						chainId: {
							equals: BigInt(parseInt(params.chainId)),
						},
					},
				},
			},
		},
	});
	const collectionCreator = collectionCreaterAddress
		? (
				await client.query({
					query: findUserProfile,
					variables: {
						where: {
							address: {
								equals: collectionCreaterAddress,
								mode: QueryMode.Insensitive,
							},
						},
					},
				})
			).data.findFirstUserProfile
		: undefined;
	console.log(
		'this is the collection creator',
		collectionCreator,
		collectionCreaterAddress,
	);
	return {
		props: {
			...(await serverSideTranslations(locale, ['common'])),
			metadata,
			metadataOffChain: data.findFirstNFT,
			collectionName,
			collectionCreator,
			collectionCreaterAddress,
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
	const router = useRouter();
	const { tokenId } = router.query;
	const { t } = useTranslation('common');
	const dispName = _props.metadata.name ?? `# ${tokenId}`;
	const collectionDispName =
		_props.collectionName ??
		getAddressAbbreviation(router.query.address as string);
	return (
		<div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-8 h-full">
			{/* Left Side: NFT Image */}
			<div className="h-full aspect-square shrink-0">
				<Card className="h-full overflow-hidden rounded-2xl shadow-lg p-0">
					<CardContent className="p-0 relative h-full">
						<Image
							src={_props.metadata.image} // Replace with actual NFT image URL
							alt="NFT Image"
							fill
							className="h-full w-auto object-cover"
						/>
					</CardContent>
				</Card>
			</div>

			{/* Right Side: Details */}
			<div className="flex-1 space-y-4">
				{/* Title */}
				<h1 className="text-2xl font-bold">{dispName}</h1>
				<p className="text-sm text-muted-foreground">
					{t('Owned by')}&nbsp;
					{_props.metadataOffChain.user.username ||
						getAddressAbbreviation(
							_props.metadataOffChain.user.address,
						)}
				</p>

				<div>
					<Badge variant="outline">
						{getIconOfChain(router.query.chainId as string)}&nbsp;
						{getNameOfChain(router.query.chainId as string)}
					</Badge>
					<Badge variant="outline">
						{t('TOKEN')}&nbsp;#{router.query.tokenId}
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
							{t('More from Collection')}
						</CustomTabsTrigger>
					</TabsList>

					<TabsContent
						value="traits"
						className="p-4 border rounded-lg"
					>
						Traits content here
					</TabsContent>
					<TabsContent
						value="about"
						className="p-4 border rounded-lg"
					>
						<div>
							<h3 className="text-foreground font-bold">
								{t('About')}&nbsp;{dispName}
							</h3>
							<p className="text-sm text-muted-foreground">
								{_props.metadata.description}
							</p>
						</div>
						<Separator className="my-4 " />
						<div>
							<h3 className="text-foreground font-bold">
								{t('About')}&nbsp;{collectionDispName}
							</h3>
							{(_props.collectionCreator ||
								_props.collectionCreaterAddress) && (
								<>
									<div className="text-xs text-muted-foreground flex items-center">
										{t('A collection by')}
										&nbsp;
										<div className="flex items-center cursor-pointer">
											<ProfileAvatar
												avatar={
													_props.collectionCreator
														?.avatar
												}
												address={
													_props.collectionCreaterAddress
												}
												className="inline-block size-4 mr-1 ml-2"
											/>
											<span className="text-foreground">
												{_props.collectionCreator
													? (_props.collectionCreator
															.username ??
														getAddressAbbreviation(
															_props
																.collectionCreator
																.address,
														))
													: getAddressAbbreviation(
															_props.collectionCreaterAddress,
														)}
											</span>
										</div>
									</div>
								</>
							)}
							<p className="text-sm text-muted-foreground">
								{_props.metadataOffChain.collection.description}
							</p>
						</div>
						<Separator className="my-4 " />
						<div className="flex flex-col select-text gap-3">
							<div className="flex justify-between">
								<span className="text-sm text-muted-foreground leading-normal">
									{t('Contract Address')}
								</span>
								<Link
									className="no-underline text-primary"
									href={
										new URL(
											router.query.address as string,
											getExplorerOfChain(
												router.query.chainId as string,
											),
										)
									}
								>
									{getAddressAbbreviation(
										router.query.address as string,
									)}
								</Link>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-muted-foreground leading-normal">
									{t('Token ID')}
								</span>
								<span className="no-underline">
									{router.query.tokenId}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-muted-foreground leading-normal">
									{t('Chain')}
								</span>
								<span className="no-underline">
									{getNameOfChain(
										router.query.chainId as string,
									)}
								</span>
							</div>
						</div>
					</TabsContent>
					<TabsContent
						value="more"
						className="p-4 border rounded-lg"
					>
						More NFTs from this collection
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
