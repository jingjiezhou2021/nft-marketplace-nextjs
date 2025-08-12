import { QueryMode } from '@/apollo/gql/graphql';
import CollectionLayout from '@/components/nft/collection/layout';
import CollectionNFTGallery from '@/components/nft/collection/nft-gallery';
import { config } from '@/components/providers/RainbowKitAllProvider';
import findCollection from '@/lib/graphql/queries/find-collection';
import { NextPageWithLayout } from '@/pages/_app';
import { useQuery } from '@apollo/client';
import { ChainIdParameter } from '@wagmi/core/internal';
import { GetServerSideProps, InferGetStaticPropsType } from 'next';
import { SSRConfig } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useParams } from 'next/navigation';

export const getServerSideProps: GetServerSideProps<SSRConfig> = async ({
	locale,
}) => {
	return {
		props: {
			...(await serverSideTranslations(locale!, ['common', 'filter'])),
			// Will be passed to the page component as props
		},
	};
};
const Page: NextPageWithLayout = (
	_props: Awaited<InferGetStaticPropsType<typeof getServerSideProps>>,
) => {
	const params = useParams<{ chainId: string; address: string }>();
	const chainId = parseInt(params.chainId) as ChainIdParameter<
		typeof config
	>['chainId'];
	const address = params.address as `0x${string}`;
	const { data: collection } = useQuery(findCollection, {
		variables: {
			where: {
				chainId: {
					equals: chainId,
				},
				address: {
					equals: address,
					mode: QueryMode.Insensitive,
				},
			},
		},
		fetchPolicy: 'network-only',
		nextFetchPolicy: 'cache-first',
	});
	return (
		<>
			<CollectionNFTGallery
				nfts={collection?.findFirstCollection?.importedNfts ?? []}
				className="mt-4"
			/>
		</>
	);
};
Page.GetLayout = CollectionLayout;
export default Page;
