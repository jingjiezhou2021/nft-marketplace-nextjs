import { InferGetStaticPropsType } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import createApolloClient from '@/apollo';
import { graphql } from '@/apollo/gql/gql';
import { Button } from '@/components/ui/button';
import { Aperture, Brush, CircleUser, Gamepad2 } from 'lucide-react';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	BaseCircleColorful,
	EthereumCircleColorful,
} from '@ant-design/web3-icons';
export const getStaticProps = async ({ locale }) => {
	const client = createApolloClient();
	const exampleQuery = graphql(`
		query ExampleQuery {
			activeItems {
				seller
				nftAddress
				tokenId
				listing {
					price
					erc20TokenAddress
					erc20TokenName
				}
			}
		}
	`);
	const { data } = await client.query({
		query: exampleQuery,
	});
	return {
		props: {
			...(await serverSideTranslations(locale, ['common'])),
			data,
			// Will be passed to the page component as props
		},
		revalidate: 60,
	};
};
export default function Page(
	_props: InferGetStaticPropsType<typeof getStaticProps>,
) {
	const { t } = useTranslation('common');
	const genres = [
		{ label: t('Gaming'), icon: <Gamepad2 /> },
		{ label: t('Art'), icon: <Brush /> },
		{ label: t('PFPs'), icon: <CircleUser /> },
		{ label: t('Photography'), icon: <Aperture /> },
	];
	return (
		<div className="h-full">
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
		</div>
	);
}
