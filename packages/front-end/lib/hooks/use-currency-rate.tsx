import { Listing } from '@/apollo/gql/graphql';
import { useReadIerc2362ValueFor } from 'smart-contract/wagmi/generated';
import { getCurrencyRate } from '../currency';
import { ChainIdParameter } from '@wagmi/core/internal';
import { config } from '@/components/providers/RainbowKitAllProvider';
import { useEffect, useState } from 'react';
export const PRICEFEED_DECIMALS = 6;
export default function useCurrencyRate({
	erc20TokenAddress,
	chainId,
}: Pick<Listing, 'erc20TokenAddress'> & {
	chainId: ChainIdParameter<typeof config>['chainId'];
}) {
	const [data, setData] = useState<bigint>(0n);
	const [decimals, setDecimals] = useState<number>(0);
	const [loading, setLoading] = useState(true);
	useEffect(() => {
		setLoading(true);
		getCurrencyRate({ erc20TokenAddress, chainId }).then(
			({ data, decimals }) => {
				setData(data);
				setDecimals(decimals);
				setLoading(false);
			},
		);
	}, [erc20TokenAddress, chainId]);
	return {
		data,
		decimals,
		loading,
	};
}
