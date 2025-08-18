import * as React from 'react';
import Image from 'next/image';
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerDescription,
	DrawerFooter,
	DrawerTrigger,
	DrawerClose,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'next-i18next';
import {
	BadgeCheck,
	Circle,
	CircleCheck,
	CircleDot,
	CircleMinus,
	Disc,
	Dot,
} from 'lucide-react';
import { MetaMaskColorful } from '@ant-design/web3-icons';
import { NFTDetailProps } from '.';
import { useQuery } from '@apollo/client';
import findNFT, { findNFTs } from '@/lib/graphql/queries/find-nft';
import { QueryMode } from '@/apollo/gql/graphql';
import useNFTMetadata from '@/lib/hooks/use-nft-metadata';
import { LoadingMask, LoadingSpinner } from '@/components/loading';
import useCollectionName from '@/lib/hooks/use-collection-name';
import CryptoPrice from '@/components/crypto-price';
import useTotalPrice from '@/lib/hooks/use-total-price';
import { ChainIdParameter } from '@wagmi/core/internal';
import { config } from '@/components/providers/RainbowKitAllProvider';
import {
	useAccount,
	useBalance,
	useConnectorClient,
	useReadContracts,
	useWalletClient,
} from 'wagmi';
import { getAddressAbbreviation } from '@/lib/address';
import { useAccountModal, useConnectModal } from '@rainbow-me/rainbowkit';
import { Card, CardContent } from '@/components/ui/card';
import { IconCircleFilled, IconPlaystationCircle } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import {
	erc20Abi,
	useReadIerc20BalanceOf,
} from 'smart-contract/wagmi/generated';
import ConfirmBuyDialog from '../dialog/confirm-buy';
import { getWalletIcon } from '@/lib/wallet';
function NftPriceCard({ nft }: { nft: NFTDetailProps }) {
	const { metadata, loading: metadataLoading } = useNFTMetadata(
		nft.contractAddress,
		nft.tokenId,
		nft.chainId,
	);
	const { name: collectionName, loading: collectionNameLoading } =
		useCollectionName(nft.contractAddress, nft.chainId);
	const { data, loading } = useQuery(findNFT, {
		variables: {
			where: {
				contractAddress: {
					equals: nft.contractAddress,
					mode: QueryMode.Insensitive,
				},
				tokenId: {
					equals: nft.tokenId,
				},
				collection: {
					is: {
						chainId: {
							equals: nft.chainId,
						},
					},
				},
			},
		},
		fetchPolicy: 'network-only',
		nextFetchPolicy: 'cache-first',
	});
	return (
		<div className="flex justify-between relative items-center mt-6 min-h-20">
			<LoadingMask
				className="flex justify-center items-center"
				loading={loading || metadataLoading || collectionNameLoading}
			>
				<LoadingSpinner size={24} />
			</LoadingMask>
			{metadata && (
				<div className="flex items-center space-x-4">
					<Image
						src={metadata.image}
						alt="Bored Ape"
						width={60}
						height={60}
						className="rounded"
					/>
					<div>
						<p className="font-semibold">{metadata.name}</p>
						<div className="flex items-center space-x-1">
							<p className="text-muted-foreground">
								{collectionName}
							</p>
						</div>
					</div>
				</div>
			)}

			{/* Right: Price */}
			{data?.findFirstNFT?.activeItem && (
				<div>
					<CryptoPrice
						className="flex"
						chainId={nft.chainId}
						erc20TokenAddress={
							data?.findFirstNFT.activeItem.listing
								.erc20TokenAddress
						}
						erc20TokenName={
							data?.findFirstNFT.activeItem.listing.erc20TokenName
						}
						price={data.findFirstNFT.activeItem.listing.price}
					/>
				</div>
			)}
		</div>
	);
}
function InsufficientFunds({ className }: { className?: string }) {
	const { t } = useTranslation('common');
	return (
		<div
			className={cn(
				'flex items-center space-x-2 text-destructive text-sm',
				className,
			)}
		>
			<CircleMinus size={14} />
			<span>{t('Insufficient funds')}</span>
		</div>
	);
}
export function CheckoutDrawer({
	children,
	nfts,
	chainId,
}: {
	children: React.ReactNode;
	nfts: NFTDetailProps[];
	chainId: ChainIdParameter<typeof config>['chainId'];
}) {
	const { t } = useTranslation('common');
	const {
		totalPrice,
		loading: totalPriceLoading,
		balanceEnough,
	} = useTotalPrice(chainId, nfts);
	const { connector, address } = useAccount();
	const { openConnectModal } = useConnectModal();
	const [open, setOpen] = React.useState(false);
	const [openActionModal, setOpenActionModal] = React.useState(false);
	React.useEffect(() => {
		if (open && !address) {
			openConnectModal?.();
			setOpen(false);
		}
	}, [open]);
	return (
		<Drawer
			onOpenChange={setOpen}
			open={open}
		>
			<DrawerTrigger asChild>{children}</DrawerTrigger>
			<DrawerContent>
				<div className="w-full p-4 relative">
					<LoadingMask
						loading={totalPriceLoading}
						className="flex justify-center items-center top-0"
					>
						<LoadingSpinner size={36} />
					</LoadingMask>
					{/* Header */}
					<DrawerHeader className="px-0 py-2">
						<DrawerTitle
							className="text-xl font-semibold"
							asChild
						>
							<h2 className="text-left">{t('Checkout')}</h2>
						</DrawerTitle>
					</DrawerHeader>
					<div className="flex flex-col lg:flex-row lg:justify-between gap-6 overflow-y-auto w-full">
						{/* LEFT: Items */}
						<div className="lg:w-1/2 lg:border-r border-r-border lg:pr-8">
							<ul>
								{nfts.map((nft) => {
									return (
										<li
											key={`${nft.contractAddress}-${nft.tokenId}`}
										>
											<NftPriceCard nft={nft} />
										</li>
									);
								})}
							</ul>

							<Separator
								className="my-4"
								orientation="horizontal"
							/>

							{/* Total */}
							<div className="relative">
								<div className="flex justify-between font-semibold text-lg items-center">
									<span>{t('Total')}</span>
									{totalPrice.entries().map((e) => {
										return (
											<CryptoPrice
												className="flex"
												key={e[0]}
												chainId={chainId}
												erc20TokenAddress={e[0]}
												erc20TokenName={e[1].name}
												price={e[1].price}
											/>
										);
									})}
								</div>
							</div>
						</div>
						{/* RIGHT: Payment */}
						<div className="lg:w-1/2">
							{/* Payment */}
							<div>
								<h2 className="text-sm font-semibold text-muted-foreground">
									{t('PAYMENT')}
								</h2>
								<Card className="p-0 mt-2">
									<CardContent className="p-0">
										<div className="p-4 rounded-lg flex items-center justify-between">
											<div className="md:flex md:items-center space-x-3">
												{getWalletIcon(connector?.name)}
												<div className="font-medium">
													{connector?.name}&nbsp;
													<span className="text-sm text-muted-foreground">
														{getAddressAbbreviation(
															address,
														)}
													</span>
												</div>
											</div>
											<div className="flex gap-2 items-center">
												<Button
													variant="outline"
													className="hidden md:flex text-primary border-primary dark:border-primary"
													disabled
												>
													{t('Connected')}
												</Button>
												<div className="size-6 rounded-full border-2 border-primary flex justify-center items-center text-primary">
													<IconCircleFilled
														size={12}
													/>
												</div>
											</div>
										</div>
									</CardContent>
								</Card>
							</div>

							{!balanceEnough && (
								<InsufficientFunds className="mt-4" />
							)}

							{/* Footer */}
							<DrawerFooter className="mt-4 px-0 flex-row flex justify-between">
								<Button
									className="w-[48%]"
									disabled={!balanceEnough}
									onClick={() => {
										setOpenActionModal(true);
									}}
								>
									{t('Buy')}
								</Button>
								<DrawerClose asChild>
									<Button
										variant="secondary"
										className="w-[48%]"
									>
										{t('Cancel')}
									</Button>
								</DrawerClose>
							</DrawerFooter>
							{chainId && (
								<ConfirmBuyDialog
									open={openActionModal}
									nfts={nfts}
									chainId={chainId}
								/>
							)}
						</div>
					</div>
				</div>
			</DrawerContent>
		</Drawer>
	);
}
