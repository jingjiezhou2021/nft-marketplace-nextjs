import { LoadingMask, LoadingSpinner } from '@/components/loading';
import { config } from '@/components/providers/RainbowKitAllProvider';
import CustomTable, {
	CustomTableHeaderFilterButton,
} from '@/components/tables/custom-table';
import useNFTMetadata from '@/lib/hooks/use-nft-metadata';
import { ColumnDef } from '@tanstack/react-table';
import { ChainIdParameter } from '@wagmi/core/internal';
import { useTranslation } from 'next-i18next';
import { NFTDetailProps } from '.';
import { Listing } from '@/apollo/gql/graphql';
import useNFTOffers from '@/lib/hooks/use-nft-offers';
import CryptoPrice from '@/components/crypto-price';
import { ProfileCard } from '@/components/profile/profile-card';
import { formatDistance } from 'date-fns';
import getDateFnsLocale from '@/lib/getDateFnsLocale';
import { IconArrowUpRight, IconTag } from '@tabler/icons-react';
import { getDateDiffStr } from '@/lib/utils';
type OfferTableData = {
	priceListing: Pick<
		Listing,
		'erc20TokenAddress' | 'erc20TokenName' | 'price'
	>;
	buyer: `0x${string}`;
	time: Date;
};
export default function NFTDetailOffers({
	contractAddress,
	tokenId,
	chainId,
}: NFTDetailProps) {
	const { t, i18n } = useTranslation('common');
	const { filteredOffers, loading } = useNFTOffers([
		{ contractAddress, tokenId, chainId },
	]);
	const columns: ColumnDef<OfferTableData>[] = [
		{
			accessorKey: 'priceListing',
			header: ({ column }) => {
				return (
					<CustomTableHeaderFilterButton column={column}>
						{t('PRICE')}
					</CustomTableHeaderFilterButton>
				);
			},
			cell({ row }) {
				return (
					<div>
						<CryptoPrice
							chainId={chainId}
							erc20TokenAddress={
								row.original.priceListing.erc20TokenAddress
							}
							erc20TokenName={
								row.original.priceListing.erc20TokenName
							}
							price={row.original.priceListing.price}
						/>
					</div>
				);
			},
			sortingFn(rowA, rowB) {
				if (
					rowA.original.priceListing.erc20TokenAddress ===
					rowB.original.priceListing.erc20TokenAddress
				) {
					return rowA.original.priceListing.price -
						rowB.original.priceListing.price <
						0n
						? -1
						: 1;
				} else {
					return rowA.original.priceListing.erc20TokenAddress <
						rowB.original.priceListing.erc20TokenAddress
						? -1
						: 1;
				}
			},
		},
		{
			accessorKey: 'buyer',
			header: () => {
				return (
					<div className="text-muted-foreground text-xs">
						{t('FROM')}
					</div>
				);
			},
			cell({ row }) {
				return (
					<div>
						<ProfileCard address={row.original.buyer}>
							{(dispName, isYou) => {
								return (
									<div className="cursor-pointer">
										{isYou ? t('You') : dispName}
									</div>
								);
							}}
						</ProfileCard>
					</div>
				);
			},
		},
		{
			accessorKey: 'time',
			header: ({ column }) => {
				return (
					<CustomTableHeaderFilterButton column={column}>
						{t('TIME')}
					</CustomTableHeaderFilterButton>
				);
			},
			cell({ row }) {
				return (
					<div className="font-serif flex items-center cursor-pointer">
						{getDateDiffStr(
							new Date(),
							row.original.time,
							getDateFnsLocale(i18n.language),
						)}
						<IconArrowUpRight className="text-muted-foreground" />
					</div>
				);
			},
		},
	];
	const data: OfferTableData[] = filteredOffers.map((offer) => {
		return {
			priceListing: offer.listing,
			buyer: offer.buyer as `0x${string}`,
			time: offer.itemOfferMade?.createdAt,
		};
	});
	return (
		<div className="relative">
			<CustomTable
				columns={columns}
				data={data}
				rowCursor
				columnPinningState={{ left: [], right: [] }}
			/>
			<LoadingMask
				loading={loading}
				className="flex justify-center items-center top-0"
			>
				<LoadingSpinner size={24}></LoadingSpinner>
			</LoadingMask>
		</div>
	);
}
