import { LoadingMask, LoadingSpinner } from '@/components/loading';
import { config } from '@/components/providers/RainbowKitAllProvider';
import CustomTable from '@/components/tables/custom-table';
import useNFTMetadata from '@/lib/hooks/use-nft-metadata';
import { ColumnDef } from '@tanstack/react-table';
import { ChainIdParameter } from '@wagmi/core/internal';
import { useTranslation } from 'next-i18next';
import { NFTDetailProps } from '.';
type Attribute_Trait = {
	attribute: string;
	trait: string;
};
export default function NFTDetailTraits({
	contractAddress,
	tokenId,
	chainId,
}: NFTDetailProps) {
	const { t } = useTranslation('common');
	const { metadata, loading } = useNFTMetadata(
		contractAddress,
		tokenId,
		chainId,
	);
	const columns: ColumnDef<Attribute_Trait>[] = [
		{
			accessorKey: 'attribute',
			header: () => {
				return (
					<div className="text-muted-foreground text-xs">
						{t('ATTRIBUTE')}
					</div>
				);
			},
			cell({ row }) {
				return (
					<div className="font-light font-mono">
						{row.original.attribute}
					</div>
				);
			},
		},
		{
			accessorKey: 'trait',
			header: () => {
				return (
					<div className="text-muted-foreground text-xs">
						{t('TRAIT')}
					</div>
				);
			},
			cell({ row }) {
				return <div className="font-light">{row.original.trait}</div>;
			},
		},
	];
	const data: Attribute_Trait[] = loading
		? []
		: metadata!.attributes!.map((a) => {
				if (a.trait_type) {
					return {
						attribute: a.trait_type.toString(),
						trait: a.value.toString(),
					};
				} else {
					return {
						attribute: Object.entries(a)[0][0],
						trait: (
							Object.entries(a)[0][1] as string | number
						).toString(),
					};
				}
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
