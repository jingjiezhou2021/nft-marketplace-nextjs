import { InferGetStaticPropsType } from 'next';
import { useTranslation } from 'next-i18next';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
export async function getStaticProps({ locale }) {
	return {
		props: {
			...(await serverSideTranslations(locale, ['common'])),
			// Will be passed to the page component as props
		},
	};
}
export default function Page(
	_props: InferGetStaticPropsType<typeof getStaticProps>,
) {
	const { t } = useTranslation('common');
	return (
		<div>
			<h1>{t('Hello, Next.js!')}</h1>
			<ConnectButton />
		</div>
	);
}
