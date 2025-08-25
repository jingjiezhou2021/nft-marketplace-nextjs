import WalletNotConnected from '@/components/wallet-not-connected';
import { InferGetStaticPropsType } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAccount } from 'wagmi';

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
	const router = useRouter();
	const { address, status } = useAccount();
	useEffect(() => {
		if (status === 'connected' && address) {
			router.push(`/profile/${address}`, undefined, {
				locale: _props._nextI18Next?.initialLocale,
			});
		}
	}, [status, address, router, _props._nextI18Next?.initialLocale]);
	return <WalletNotConnected />;
}
