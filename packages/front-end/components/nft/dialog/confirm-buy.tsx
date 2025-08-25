import { ChainIdParameter } from '@wagmi/core/internal';
import { NFTDetailProps } from '../detail';
import { config } from '@/components/providers/RainbowKitAllProvider';
import useTotalPrice from '@/lib/hooks/use-total-price';
import StepsDialog from '@/components/steps-dialog';
import { Dialog } from '@/components/ui/dialog';
import useMessage from 'antd/es/message/useMessage';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';
import { CHAIN_CURRENCY_ADDRESS, getCryptoIcon } from '@/lib/currency';
import { StepProps } from 'antd';
import { CircleCheckIcon, CircleX } from 'lucide-react';
import Link from 'next/link';
import {
	useWriteIerc20Approve,
	useWriteNftMarketplaceBatchBuyItem,
} from 'smart-contract/wagmi/generated';
import { useWaitForTransactionReceipt } from 'wagmi';
import MARKETPLACE_ADDRESS from '@/lib/market';
import { useQuery } from '@apollo/client';
import { findNFTs } from '@/lib/graphql/queries/find-nft';
import { QueryMode } from '@/apollo/gql/graphql';
import useLockedChain from '@/lib/hooks/use-locked-chain';
export default function ConfirmBuyDialog({
	nfts,
	chainId,
	...props
}: React.ComponentProps<typeof Dialog> & {
	nfts: NFTDetailProps[];
	chainId: NonNullable<ChainIdParameter<typeof config>['chainId']>;
}) {
	useLockedChain(chainId);
	const { data, loading: dataLoading } = useQuery(findNFTs, {
		variables: {
			where: {
				OR: nfts.map((nft) => {
					return {
						contractAddress: {
							equals: nft.contractAddress,
							mode: QueryMode.Insensitive,
						},
						tokenId: {
							equals: nft.tokenId,
						},
						collection: {
							is: {
								chainId: {
									equals: nft.chainId,
								},
							},
						},
					};
				}),
			},
		},
	});
	const {
		totalPrice,
		loading: totalPriceLoading,
		balanceEnough,
		ethPayAmount,
	} = useTotalPrice(chainId, nfts);
	const [messageApi, contextHolder] = useMessage();
	const [currentStep, setCurrentStep] = useState(0);
	const { t, i18n } = useTranslation('common');
	const steps: StepProps[] = [
		...Array.from(totalPrice.entries())
			.filter((e) => {
				return e[0] !== CHAIN_CURRENCY_ADDRESS[chainId].WETH;
			})
			.map((e) => {
				return {
					title: (
						<>
							{t('Approve')}&nbsp;
							<span className="text-xs text-muted-foreground">
								{e[1].name}&nbsp;
								{getCryptoIcon(chainId, e[0])}
							</span>
						</>
					),
				};
			}),
		{
			title: t('Pay'),
			description: t(
				'Everything is ready, now you can finally pay to confirm purchase',
			),
		},
	];
	const {
		writeContract: writeErc20Approve,
		isPending: approvePending,
		data: approveHash,
	} = useWriteIerc20Approve();
	const { isLoading: approveConfirming, isSuccess: approveConfirmed } =
		useWaitForTransactionReceipt({
			hash: approveHash,
		});
	const {
		writeContract: writeBatchBuy,
		isPending: batchBuyPending,
		data: batchBuyHash,
	} = useWriteNftMarketplaceBatchBuyItem();
	const { isLoading: batchBuyConfirming, isSuccess: batchBuyConfirmed } =
		useWaitForTransactionReceipt({
			hash: batchBuyHash,
		});
	useEffect(() => {
		if (approveConfirmed) {
			messageApi.success(t('Approve successful'));
			setCurrentStep((cur) => cur + 1);
		}
	}, [approveConfirmed]);
	useEffect(() => {
		if (batchBuyConfirmed) {
			messageApi.success(t('Purchase successful'));
			setCurrentStep((cur) => cur + 1);
		}
	}, [batchBuyConfirmed]);
	return (
		<>
			{contextHolder}
			<StepsDialog
				currentStep={currentStep}
				steps={steps}
				loading={
					totalPriceLoading ||
					approvePending ||
					approveConfirming ||
					batchBuyConfirming ||
					batchBuyPending
				}
				successContent={
					<>
						<div className="w-full flex flex-col gap-4 items-center">
							<CircleCheckIcon
								className="text-primary"
								size={36}
							/>
							<h3>{t('Buy Item successful')}</h3>
							<Link
								href={`/`}
								locale={i18n.language}
							>
								<Button>{t('Go back to home page')}</Button>
							</Link>
						</div>
					</>
				}
				{...props}
			>
				<>
					{balanceEnough ? (
						<>
							{Array.from(totalPrice.entries())
								.filter((e) => {
									return (
										e[0] !==
										CHAIN_CURRENCY_ADDRESS[chainId].WETH
									);
								})
								.map((e, index) => {
									return (
										<Button
											key={e[0]}
											className="flex w-1/2 py-3 h-auto max-w-64"
											disabled={currentStep !== index}
											variant={
												currentStep === index
													? 'default'
													: 'secondary'
											}
											onClick={() => {
												writeErc20Approve({
													address:
														e[0] as `0x${string}`,
													chainId,
													args: [
														MARKETPLACE_ADDRESS[
															chainId
														] as `0x${string}`,
														e[1].price,
													],
												});
											}}
										>
											{t('Approve')}
											{getCryptoIcon(chainId, e[0])}
										</Button>
									);
								})}
							<Button
								className="flex w-1/2 py-3 h-auto max-w-64"
								disabled={
									currentStep !== steps.length - 1 ||
									dataLoading ||
									data === undefined
								}
								variant={
									currentStep === steps.length - 1
										? 'default'
										: 'secondary'
								}
								onClick={() => {
									writeBatchBuy({
										address: MARKETPLACE_ADDRESS[
											chainId
										] as `0x${string}`,
										chainId,
										args: [
											data!.nFTS.map((nftData) => {
												return {
													owner: nftData.user
														.address as `0x${string}`,
													nftAddress:
														nftData.contractAddress as `0x${string}`,
													tokenId: nftData.tokenId,
												};
											}),
										],
										value: ethPayAmount,
									});
								}}
							>
								{t('Pay')}
							</Button>
						</>
					) : (
						<div className="flex flex-col items-center">
							<CircleX
								className="text-destructive"
								size={36}
							></CircleX>
							<p className="text-destructive">
								{t('Balance not enough')}
							</p>
						</div>
					)}
				</>
			</StepsDialog>
		</>
	);
}
