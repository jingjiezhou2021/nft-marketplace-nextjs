import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export async function getServerSideProps({ locale }) {
	const i18n = await serverSideTranslations(locale, ['common']);
	return {
		redirect: {
			destination: `/${i18n._nextI18Next.initialLocale}/settings/profile`,
			permanent: true,
		},
	};
}
export default function Page() {
	return <></>;
}
