import { InferGetStaticPropsType } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import SettingsLayout from '@/components/settings-layout';
import { NextPageWithLayout } from '@/pages/_app';
import { useTranslation } from 'next-i18next';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { i18n as I18n } from '@/next-i18next.config';
export const getStaticProps = async ({ locale }) => {
	return {
		props: {
			...(await serverSideTranslations(locale, ['common'])),
			// Will be passed to the page component as props
		},
		revalidate: 60,
	};
};
const Page: NextPageWithLayout = (
	_props: InferGetStaticPropsType<typeof getStaticProps>,
) => {
	const { i18n } = useTranslation('common');
	const pathname = usePathname();
	const languageTitles = new Map<string, string>([
		['zh', '中文'],
		['en', 'English'],
	]);
	return (
		<div className="w-full h-full pt-2 flex items-center md:block">
			<ul className="w-full">
				{I18n.locales.map((lng) => {
					const title = languageTitles.get(lng);
					return (
						<li
							key={lng}
							className="w-full"
						>
							<Link
								href={pathname}
								locale={lng}
								className="w-full"
							>
								<Button
									className="w-full"
									variant={
										i18n.language === lng
											? 'default'
											: 'ghost'
									}
								>
									{title}
								</Button>
							</Link>
						</li>
					);
				})}
			</ul>
		</div>
	);
};
Page.GetLayout = SettingsLayout;
export default Page;
