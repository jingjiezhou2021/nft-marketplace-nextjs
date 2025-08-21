import { useQuery } from '@apollo/client';
import findOffer from '../graphql/queries/find-offer';
import { useMemo } from 'react';
import {
	useReadIerc20Allowance,
	useReadIerc20BalanceOf,
} from 'smart-contract/wagmi/generated';
import MARKETPLACE_ADDRESS from '../market';
export enum OfferStatus {
	OPEN,
	CANCELED,
	ACCEPTED,
	NON_PAYABLE,
}
export default function useOffer(offerId: bigint, chainId: number) {
	const { data: offerData, loading: offerDataLoading } = useQuery(findOffer, {
		variables: {
			where: {
				offerId: {
					equals: offerId,
				},
				chainId: {
					equals: chainId,
				},
			},
		},
	});
	const { data: balance } = useReadIerc20BalanceOf({
		address: offerData?.findFirstOffer?.listing
			.erc20TokenAddress as `0x${string}`,
		chainId,
		args: [offerData?.findFirstOffer?.buyer as `0x${string}`],
	});
	const { data: allowance } = useReadIerc20Allowance({
		address: offerData?.findFirstOffer?.listing
			.erc20TokenAddress as `0x${string}`,
		chainId,
		args: [
			offerData?.findFirstOffer?.buyer as `0x${string}`,
			MARKETPLACE_ADDRESS[chainId],
		],
	});
	const status = useMemo(() => {
		console.log(
			'calculating status',
			balance,
			allowance,
			offerData?.findFirstOffer?.listing.price,
		);
		if (offerData?.findFirstOffer?.itemOfferCanceled) {
			return OfferStatus.CANCELED;
		} else if (offerData?.findFirstOffer?.itemOfferAccepted) {
			return OfferStatus.ACCEPTED;
		} else if (
			(balance !== undefined &&
				balance < offerData?.findFirstOffer?.listing.price) ||
			(allowance !== undefined &&
				allowance < offerData?.findFirstOffer?.listing.price)
		) {
			return OfferStatus.NON_PAYABLE;
		} else {
			return OfferStatus.OPEN;
		}
	}, [offerData, balance, allowance]);
	return {
		data: offerData,
		loading: offerDataLoading,
		status,
	};
}
