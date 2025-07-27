import { IconCirclePlus } from '@tabler/icons-react';
import { CardContentWrapper, CardFooterWrapper, CardWrapper } from './nft-card';
import { useTranslation } from 'next-i18next';

export default function ImportNFTCard({
	className,
	children,
	...props
}: Parameters<typeof CardWrapper>[0]) {
	const { t } = useTranslation('common');
	return (
		<CardWrapper
			className={className}
			{...props}
		>
			<CardContentWrapper>
				<div className="size-full text-primary flex justify-center items-center">
					<IconCirclePlus size={128} />
				</div>
			</CardContentWrapper>
			<CardFooterWrapper>
				<h3 className="font-medium text-md pb-2 text-center">
					{t('Import')}
				</h3>
			</CardFooterWrapper>
		</CardWrapper>
	);
}
