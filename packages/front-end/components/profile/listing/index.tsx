import { LoadingMask, LoadingSpinner } from '@/components/loading';
import { Badge } from '@/components/ui/badge';
import findListing from '@/lib/graphql/queries/find-listing';
import { cn } from '@/lib/utils';
import { useQuery } from '@apollo/client';
import { CircleCheck, CircleX, ShoppingBag } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { ReactElement } from 'react';

export default function ProfileListingStatus({
	listingId,
	className,
}: {
	listingId: string;
	className?: string;
}) {
	const { t, i18n } = useTranslation('common');
	const { data, loading } = useQuery(findListing, {
		variables: {
			where: {
				id: {
					equals: listingId,
				},
			},
		},
	});
	let content: ReactElement;
	if (data?.findFirstNftMarketplace__ItemListed?.itemBought) {
		content = (
			<>
				<ShoppingBag className="text-green-400" />
				<span>{t('Bought')}</span>
			</>
		);
	} else if (data?.findFirstNftMarketplace__ItemListed?.itemCanceled) {
		content = (
			<>
				<CircleX className="text-destructive" />
				<span>{t('Canceled')}</span>
			</>
		);
	} else if (data?.findFirstNftMarketplace__ItemListed?.activeItem) {
		content = (
			<>
				<CircleCheck className="text-primary" />
				<span>{t('Active')}</span>
			</>
		);
	} else {
		content = <span>-</span>;
	}
	return (
		<div className={cn('relative', className)}>
			<LoadingMask
				loading={loading || !data?.findFirstNftMarketplace__ItemListed}
				className="flex justify-center items-center"
			>
				<LoadingSpinner size={16} />
			</LoadingMask>
			<Badge variant={'outline'}>{content}</Badge>
		</div>
	);
}
