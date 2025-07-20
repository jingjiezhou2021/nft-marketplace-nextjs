import { Button } from '@/components/ui/button';
import {
	BaseCircleColorful,
	EthereumCircleColorful,
} from '@ant-design/web3-icons';
import { useTranslation } from 'next-i18next';
import { PriceFilter } from '../PriceFilter';
import { DrawerClose } from '@/components/ui/drawer';
export default function NFTTableFilter() {
	const { t } = useTranslation('common');
	return (
		<div className="p-6 flex flex-col gap-4 relative overflow-y-scroll">
			<h4>{t('Category')}</h4>
			<div className="flex flex-wrap gap-2">
				<Button variant="outline">{t('All')}</Button>
				<Button variant="outline">{t('Art')}</Button>
				<Button variant="outline">{t('Gaming')}</Button>
				<Button variant="outline">{t('PFPs')}</Button>
				<Button variant="outline">{t('Photography')}</Button>
			</div>
			<hr />
			<h4>{t('Chains')}</h4>
			<div className="flex flex-wrap gap-2">
				<Button variant="outline">
					<EthereumCircleColorful />
					Ethereum
				</Button>
				<Button variant="outline">
					<BaseCircleColorful />
					Base
				</Button>
			</div>
			<PriceFilter title={t('Floor Price')} />
			<PriceFilter title={t('Top Offer')} />
			<div className="flex justify-between gap-2 sticky bottom-0  bg-background">
				<DrawerClose asChild>
					<Button
						variant="outline"
						className="grow"
					>
						{t('Clear All')}
					</Button>
				</DrawerClose>
				<DrawerClose asChild>
					<Button className="grow">{t('Done')}</Button>
				</DrawerClose>
			</div>
		</div>
	);
}
