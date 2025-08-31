import { LoadingMask, LoadingSpinner } from '@/components/loading';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { useTranslation } from 'next-i18next';
import { NFTDetailProps } from '../detail';
import useCollectionName from '@/lib/hooks/use-collection-name';
import { useQuery } from '@apollo/client';
import findCollection from '@/lib/graphql/queries/find-collection';
import { QueryMode } from '@/apollo/gql/graphql';
import Link from 'next/link';
import ProfileAvatar from '@/components/profile/avatar';
import useNFTMetadata from '@/lib/hooks/use-nft-metadata';
import useNFTOwner from '@/lib/hooks/use-nft-owner';
import useUser from '@/lib/hooks/use-user';
import { Separator } from '@/components/ui/separator';
import CryptoPrice from '@/components/crypto-price';
import useOffer, { OfferStatus } from '@/lib/hooks/use-offer';
import OfferStatusBadge from '@/components/offer-status-badge';
import { useAccount, useWaitForTransactionReceipt } from 'wagmi';
import { Button } from '@/components/ui/button';
import { ReactNode, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { ProfileCard } from '@/components/profile/profile-card';
import ChainBadge from '@/components/chain-badge';
import {
	useWriteNftMarketplaceAcceptOffer,
	useWriteNftMarketplaceCancelOffer,
} from 'smart-contract/wagmi/generated';
import MARKETPLACE_ADDRESS from '@/lib/market';
import useMessage from 'antd/es/message/useMessage';
import { useRouter } from 'next/router';
import AcceptOfferDialog from './accept-offer';
import useLockedChain from '@/lib/hooks/use-locked-chain';
function Description({
	children,
	className,
}: {
	className?: string;
	children: ReactNode;
}) {
	return (
		<div
			className={cn(
				'grid grid-cols-[120px_minmax(0,1fr)] gap-y-4',
				className,
			)}
		>
			{children}
		</div>
	);
}
function DescriptionItem({
	label,
	content,
}: {
	label: string;
	content: ReactNode;
}) {
	return (
		<>
			<h3 className="text-muted-foreground">{label}</h3>
			<div className="flex items-center">{content}</div>
		</>
	);
}
export default function OfferDetailDialog({
	nft,
	offerId,
	...props
}: {
	nft: NFTDetailProps;
	offerId?: bigint;
} & React.ComponentProps<typeof Dialog>) {
	useLockedChain(nft.chainId);
	const { t, i18n } = useTranslation('common');
	const { name: collectionName, loading: collectionNameLoading } =
		useCollectionName(nft.contractAddress, nft.chainId);
	const { data: collectionData, loading: collectionDataLoading } = useQuery(
		findCollection,
		{
			variables: {
				where: {
					address: {
						equals: nft.contractAddress,
						mode: QueryMode.Insensitive,
					},
					chainId: {
						equals: nft.chainId,
					},
				},
			},
		},
	);
	const { metadata, loading: metadataLoading } = useNFTMetadata(
		nft.contractAddress,
		nft.tokenId,
		nft.chainId,
	);
	const dispName = metadata?.name ?? `# ${nft.tokenId}`;
	const ownerAddress = useNFTOwner(
		nft.contractAddress,
		nft.chainId,
		nft.tokenId,
	);
	const { user: owner } = useUser(ownerAddress);
	const {
		data: offerData,
		loading: offerDataLoading,
		status: offerStatus,
		refetch: refetchOffer,
	} = useOffer(offerId!, nft.chainId!);
	const { user: bidder, loading: bidderLoading } = useUser(
		offerData?.findFirstOffer?.buyer,
	);
	const { address: userAddress } = useAccount();
	const {
		writeContract: writeCancelOffer,
		isPending: cancelOfferPending,
		data: cancelOfferHash,
		error: cancelOfferError,
	} = useWriteNftMarketplaceCancelOffer();
	const {
		isSuccess: cancelOfferConfirmed,
		isLoading: cancelOfferConfirming,
		error: cancelOfferConfirmedError,
	} = useWaitForTransactionReceipt({
		hash: cancelOfferHash,
	});
	const [messageApi, contextHolder] = useMessage();
	useEffect(() => {
		if (cancelOfferConfirmedError || cancelOfferError) {
			messageApi.error(t('Cancel offer failed'));
		}
	}, [cancelOfferConfirmedError, cancelOfferError]);
	useEffect(() => {
		if (cancelOfferConfirmed) {
			refetchOffer();
			messageApi.success(t('Cancel offer successful'));
		}
	}, [cancelOfferConfirmed]);
	const [openAcceptDialog, setOpenAcceptDialog] = useState(false);
	useEffect(() => {
		if (!openAcceptDialog) {
			refetchOffer();
		}
	}, [openAcceptDialog]);
	return (
		<Dialog {...props}>
			<DialogContent className="p-0">
				{contextHolder}
				<div className="relative flex flex-col gap-4 p-6">
					<LoadingMask
						loading={
							collectionNameLoading ||
							collectionDataLoading ||
							metadataLoading ||
							offerDataLoading ||
							bidderLoading ||
							cancelOfferPending ||
							cancelOfferConfirming
						}
						className="flex justify-center items-center top-0 left-0"
					>
						<LoadingSpinner size={48} />
					</LoadingMask>
					<DialogHeader>
						<DialogTitle>{t(`Offer details`)}</DialogTitle>
					</DialogHeader>
					<Description>
						<DescriptionItem
							label={t('Collection')}
							content={
								<Link
									href={`/nft/${nft.chainId}/${nft.contractAddress}`}
									locale={i18n.language}
									className="flex text-foreground hover:text-primary"
								>
									<ProfileAvatar
										avatar={
											collectionData?.findFirstCollection
												?.avatar
										}
										address={nft.contractAddress}
										className="size-6 mr-2"
										size={12}
									/>
									{collectionName}
								</Link>
							}
						/>
						<DescriptionItem
							label={t('Item')}
							content={
								<>
									<ProfileAvatar
										address={nft.contractAddress}
										avatar={metadata?.image}
										className="mr-2 size-6"
										size={12}
									/>
									<h4>{dispName}</h4>
								</>
							}
						/>
						<DescriptionItem
							label={t('Owner')}
							content={
								<ProfileCard
									address={ownerAddress as `0x${string}`}
								>
									{(dispName, isYou) => (
										<div className="flex items-center">
											<ProfileAvatar
												address={ownerAddress}
												avatar={owner?.avatar}
												className="mr-2 size-6"
												size={12}
											/>
											<h4>
												{isYou ? t('You') : dispName}
											</h4>
										</div>
									)}
								</ProfileCard>
							}
						/>
						<DescriptionItem
							label={t('Chain')}
							content={
								<ChainBadge
									className="-ml-1"
									chainId={nft.chainId}
								/>
							}
						/>
					</Description>
					<Separator orientation="horizontal" />
					<Description>
						<DescriptionItem
							label={t('Bidder')}
							content={
								bidder?.address && (
									<ProfileCard
										address={
											bidder?.address as `0x${string}`
										}
									>
										{(dispName, isYou) => (
											<div className="flex items-center">
												<ProfileAvatar
													address={
														bidder?.address as `0x${string}`
													}
													avatar={bidder?.avatar}
													className="mr-2 size-6"
													size={12}
												/>
												{isYou ? t('You') : dispName}
											</div>
										)}
									</ProfileCard>
								)
							}
						/>
						<DescriptionItem
							label={t('Made time')}
							content={
								<p className="text-sm text-secondary-foreground font-extralight">
									{new Date(
										offerData?.findFirstOffer?.itemOfferMade?.createdAt,
									).toLocaleString()}
								</p>
							}
						/>
						<DescriptionItem
							label={t('Price')}
							content={
								offerData?.findFirstOffer?.listing
									.erc20TokenAddress && (
									<CryptoPrice
										erc20TokenAddress={
											offerData?.findFirstOffer?.listing
												.erc20TokenAddress
										}
										erc20TokenName={
											offerData?.findFirstOffer?.listing
												.erc20TokenName!
										}
										price={
											offerData?.findFirstOffer?.listing
												.price
										}
										chainId={nft.chainId}
									/>
								)
							}
						/>
						<DescriptionItem
							label={t('Status')}
							content={
								offerId &&
								nft.chainId && (
									<OfferStatusBadge
										className="-ml-[9px]"
										offerId={offerId}
										chainId={nft.chainId}
									/>
								)
							}
						/>
					</Description>
					{(offerStatus === OfferStatus.OPEN ||
						offerStatus === OfferStatus.NON_PAYABLE) && (
						<div className="flex justify-center">
							{userAddress?.toLowerCase() ===
								ownerAddress.toLowerCase() &&
								offerId !== undefined &&
								nft.chainId && (
									<>
										<Button
											className="w-2/3"
											onClick={() => {
												setOpenAcceptDialog(true);
											}}
										>
											{t('Accept')}
										</Button>
										<AcceptOfferDialog
											open={openAcceptDialog}
											onOpenChange={setOpenAcceptDialog}
											offerId={offerId}
											chainId={nft.chainId}
										/>
									</>
								)}
							{userAddress?.toLowerCase() ===
								bidder?.address.toLowerCase() && (
								<Button
									variant="destructive"
									className="w-2/3"
									disabled={
										cancelOfferConfirming ||
										cancelOfferPending
									}
									onClick={() => {
										if (
											nft.chainId &&
											offerId !== undefined
										) {
											writeCancelOffer({
												address: MARKETPLACE_ADDRESS[
													nft.chainId
												] as `0x${string}`,
												chainId: nft.chainId,
												args: [offerId],
											});
										} else {
											messageApi.error(t('Please retry'));
										}
									}}
								>
									{t('Cancel')}
								</Button>
							)}
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
