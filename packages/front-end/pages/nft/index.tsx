import { InferGetStaticPropsType } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
export const getStaticProps = async ({ locale }) => {
	return {
		props: {
			...(await serverSideTranslations(locale, ['common'])),
			// Will be passed to the page component as props
		},
		revalidate: 60,
	};
};
export default function Page(
	_props: InferGetStaticPropsType<typeof getStaticProps>,
) {
	const { t } = useTranslation('common');
	return (
		<div>
			<h1>{t('Welcome to NFT page')}</h1>
		</div>
	);
}
