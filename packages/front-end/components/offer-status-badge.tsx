import { OfferStatus } from '@/lib/hooks/use-offer';
import { useTranslation } from 'next-i18next';
import { Badge } from './ui/badge';
import { ReactNode } from 'react';
import { Ban, BanknoteX, CircleCheck, CircleDollarSign } from 'lucide-react';
export default function OfferStatusBadge({
	offerStatus,
	className,
}: {
	offerStatus: OfferStatus;
	className?: string;
}) {
	let caption: string = '';
	let icon: ReactNode = '';
	const { t } = useTranslation('common');
	switch (offerStatus) {
		case OfferStatus.OPEN: {
			icon = (
				<>
					<CircleDollarSign />
				</>
			);
			caption = t('OPEN');
			break;
		}
		case OfferStatus.CANCELED: {
			icon = (
				<>
					<Ban className="text-destructive" />
				</>
			);
			caption = t('CANCELED');
			break;
		}
		case OfferStatus.ACCEPTED: {
			icon = (
				<>
					<CircleCheck className="text-primary" />
				</>
			);
			caption = t('ACCEPTED');
			break;
		}
		case OfferStatus.NON_PAYABLE: {
			icon = (
				<>
					<BanknoteX className="text-yellow-400" />
				</>
			);
			caption = t('NON PAYABLE');
			break;
		}
	}
	return (
		<Badge
			variant="outline"
			className={className}
		>
			{icon}&nbsp;{caption}
		</Badge>
	);
}
