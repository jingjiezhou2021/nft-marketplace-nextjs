import { Aperture, Brush, Church, CircleUser, Gamepad2 } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { Button } from './ui/button';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from './ui/select';
import {
	EthereumCircleColorful,
	BaseCircleColorful,
} from '@ant-design/web3-icons';
export default function NavInfo() {
	const { t } = useTranslation('common');
	const genres = [
		{ label: t('Gaming'), icon: <Gamepad2 /> },
		{ label: t('Art'), icon: <Brush /> },
		{ label: t('PFPs'), icon: <CircleUser /> },
		{ label: t('Photography'), icon: <Aperture /> },
		{ label: t('Membership'), icon: <Church /> },
	];
	return (
		<div className="h-auto flex justify-between flex-wrap">
			<div className="flex gap-2 text-muted-foreground h-auto mb-2">
				<Button
					variant="outline"
					className="px-2.5"
				>
					{t('All')}
				</Button>
				{genres.map((g) => {
					return (
						<Button
							variant="outline"
							className="px-2! hidden md:flex"
							key={g.label}
						>
							{g.icon}
							{g.label}
						</Button>
					);
				})}
				<Select>
					<SelectTrigger className="flex md:hidden bg-background">
						<SelectValue placeholder={t('More')}></SelectValue>
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							<SelectLabel>{t('Genres')}</SelectLabel>
							{genres.map((g) => {
								return (
									<SelectItem
										value={g.label}
										key={g.label}
									>
										{g.icon}
										{g.label}
									</SelectItem>
								);
							})}
						</SelectGroup>
					</SelectContent>
				</Select>
			</div>
			<div className="flex gap-2 h-auto items-center mb-2">
				<Button variant="outline">{t('All')}</Button>
				<EthereumCircleColorful />
				<BaseCircleColorful />
			</div>
		</div>
	);
}
