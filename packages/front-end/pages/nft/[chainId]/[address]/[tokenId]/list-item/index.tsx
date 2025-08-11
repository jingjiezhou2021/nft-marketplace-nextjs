import { ArrowLeft } from 'lucide-react';
import { GetServerSideProps, InferGetStaticPropsType } from 'next';
import { SSRConfig } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';
import { ChainIdParameter } from '@wagmi/core/internal';
import { config } from '@/components/providers/RainbowKitAllProvider';
import { useTranslation } from 'next-i18next';
import ProfileAvatar from '@/components/profile/avatar';
import useNFTMetadata from '@/hooks/use-nft-metadata';
import useCollectionName from '@/hooks/use-collection-name';
import {
	Select,
	SelectContent,
	SelectTrigger,
	SelectValue,
	SelectItem,
} from '@/components/ui/select';
import {
	CHAIN_CURRENCY_ADDRESS,
	getCryptoIcon,
	SEPOLIA_AAVE_WETH,
} from '@/lib/currency';
import { LoadingMask, LoadingSpinner } from '@/components/loading';
import { useAccount } from 'wagmi';
import useNFTOwner from '@/hooks/use-nft-owner';
import NotOwnerOfCollection from '@/components/nft/collection/not-owner-of-collection';
import NotOwnerOfNFT from '@/components/nft/not-owner-of-nft';
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

export default function Page(
	_props: Awaited<InferGetStaticPropsType<typeof getServerSideProps>>,
) {
	const { t } = useTranslation('common');
	const params = useParams<{
		chainId: string;
		address: `0x${string}`;
		tokenId: string;
	}>();
	const chainId = parseInt(params.chainId) as ChainIdParameter<
		typeof config
	>['chainId'];
	if (chainId === undefined) {
		throw new Error("chainId shouldn't have been undefined");
	}
	const WETH_ADDR = CHAIN_CURRENCY_ADDRESS[chainId].WETH;
	const USDT_ADDR = CHAIN_CURRENCY_ADDRESS[chainId].USDT;
	const address = params.address;
	const tokenId = parseInt(params.tokenId);
	const { metadata, loading: metadataLoading } = useNFTMetadata(
		address,
		tokenId,
		chainId,
	);
	const { name: collectionName, loading: collectionNameLoading } =
		useCollectionName(address, chainId);
	const router = useRouter();
	const [sellMethod, setSellMethod] = useState('set-price');
	const { address: userAddress } = useAccount();
	const nftOwnerAddress = useNFTOwner(address, chainId, tokenId);
	if (nftOwnerAddress === userAddress) {
		return (
			<div className="container mx-auto py-10 space-y-8 relative">
				<LoadingMask
					loading={metadataLoading || collectionNameLoading}
					className="flex justify-center items-center"
				>
					<LoadingSpinner size={48} />
				</LoadingMask>
				{/* Top NFT info section */}
				<div className="flex items-center gap-4">
					<button
						onClick={() => router.back()}
						className="p-2 hover:bg-muted rounded-full transition"
					>
						<ArrowLeft className="w-5 h-5" />
					</button>

					<ProfileAvatar
						address={address}
						avatar={metadata?.image}
						className="mr-0 size-12"
					/>

					<div>
						<p className="text-sm text-muted-foreground">
							{collectionName}
						</p>
						<h1 className="text-xl font-semibold">
							{metadata?.name}
						</h1>
					</div>
				</div>

				{/* Main content */}
				<div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
					{/* Left section */}
					<div>
						<h2 className="text-lg font-semibold mb-4">
							{t('Select your sell method')}
						</h2>

						<Tabs
							value={sellMethod}
							onValueChange={setSellMethod}
						>
							<TabsList className="w-full h-auto">
								<TabsTrigger
									value="set-price"
									className="flex flex-col items-center border rounded-lg p-4 data-[state=active]:border-primary"
								>
									<span className="font-semibold">
										{t('Set Price')}
									</span>
									<span className="text-xs text-muted-foreground">
										{t('Sell at a fixed price')}
									</span>
								</TabsTrigger>
							</TabsList>

							<TabsContent
								value="set-price"
								className="mt-6 space-y-6"
							>
								{/* Price */}
								<div>
									<Label
										htmlFor="price"
										className="mb-2"
									>
										{t('Price')}
									</Label>
									<div className="flex items-center gap-2 mt-1">
										<Select defaultValue={WETH_ADDR}>
											<SelectTrigger
												className="group"
												id="currency"
											>
												<SelectValue
													placeholder={t(
														'Please select the currency you wanna trade with this item',
													)}
												/>
											</SelectTrigger>
											<SelectContent>
												<SelectItem value={WETH_ADDR}>
													{getCryptoIcon(
														chainId,
														WETH_ADDR,
													)}
													ETH
												</SelectItem>
												<SelectItem value={USDT_ADDR}>
													{getCryptoIcon(
														chainId,
														USDT_ADDR,
													)}
													USDT
												</SelectItem>
											</SelectContent>
										</Select>
										<Input
											id="price"
											type="number"
											placeholder={t('Amount')}
										/>
									</div>
									<p className="text-xs text-muted-foreground mt-1">
										{t(
											'Will be on sale until you transfer this item or cancel it',
										)}
									</p>
								</div>
							</TabsContent>
						</Tabs>
					</div>

					{/* Right section: Summary */}
					<div>
						<Card>
							<CardHeader>
								<CardTitle>{t('Summary')}</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<Button className="w-full">
									{t('Post your listing')}
								</Button>
								<div>
									<p className="text-sm text-muted-foreground">
										{t(
											'Listing will interact with blockchain, which involves gas fee',
										)}
									</p>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		);
	} else {
		return <NotOwnerOfNFT />;
	}
}
