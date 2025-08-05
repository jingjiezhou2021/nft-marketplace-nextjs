import { LoadingMask, LoadingSpinner } from '@/components/loading';
import { config } from '@/components/providers/RainbowKitAllProvider';
import CustomTable from '@/components/tables/custom-table';
import useNFTMetadata from '@/hooks/use-nft-metadata';
import { ColumnDef } from '@tanstack/react-table';
import { ChainIdParameter } from '@wagmi/core/internal';
import { useTranslation } from 'next-i18next';
type Attribute_Trait = {
	attribute: string;
	trait: string;
};
export default function NFTDetailTraits({
	contractAddress,
	tokenId,
	chainId,
}: {
	contractAddress: `0x${string}`;
	tokenId: number;
	chainId: ChainIdParameter<typeof config>['chainId'];
}) {
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
				return {
					attribute: a.trait_type,
					trait: a.value.toString(),
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
