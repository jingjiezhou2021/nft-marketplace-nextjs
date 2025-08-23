import { Dialog } from '@/components/ui/dialog';
import { NFTDetailProps } from '../detail';
import { config } from '@/components/providers/RainbowKitAllProvider';
import { ChainIdParameter } from '@wagmi/core/internal';
import StepsDialog from '@/components/steps-dialog';
import { CircleCheckIcon } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import useMessage from 'antd/es/message/useMessage';
import {
	useReadIerc20Allowance,
	useReadIerc20BalanceOf,
	useReadIerc20MetadataSymbol,
	useWriteIerc20Approve,
	useWriteNftMarketplaceMakeOffer,
	useWriteWeth9Deposit,
} from 'smart-contract/wagmi/generated';
import { useAccount, useWaitForTransactionReceipt } from 'wagmi';
import { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { StepProps } from 'antd';
import useCurrencyDecimals from '@/lib/hooks/use-currency-decimals';
import { parseEther, parseUnits } from 'viem';
import {
	CHAIN_CURRENCY_ADDRESS,
	getCryptoIcon,
	getCryptoName,
} from '@/lib/currency';
import MARKETPLACE_ADDRESS from '@/lib/market';
import { useRouter } from 'next/router';

export default function MakeOfferDialog({
	nft,
	offerPrice,
	currencyAddress,
	...props
}: React.ComponentProps<typeof Dialog> & {
	nft: NFTDetailProps;
	offerPrice: number;
	currencyAddress: `0x${string}`;
}) {
	const router = useRouter();
	const [messageApi, contextHolder] = useMessage();
	const { t, i18n } = useTranslation('common');
	const { address } = useAccount();
	const {
		data: balance,
		isLoading: balanceLoading,
		refetch: refetchBalance,
	} = useReadIerc20BalanceOf({
		address: currencyAddress,
		chainId: nft.chainId,
		args: [address ?? '0x'],
	});
	const [currentStep, setCurrentStep] = useState(0);
	const { data: decimals, isPending: decimalsLoading } = useCurrencyDecimals(
		currencyAddress,
		nft.chainId,
	);
	const steps: StepProps[] = [
		{
			title: (
				<>
					{t('Check balance')} &nbsp;
					{getCryptoIcon(nft.chainId!, currencyAddress)}
				</>
			),
		},
		{
			title: t('Approve currency transfer'),
			description: t(
				'Approve the market to transfer your money when the offer is accepted by seller',
			),
		},
		{
			title: t('Post offer'),
			description: t(
				'Everything is ready, now you can finally post offer',
			),
		},
	];
	const {
		writeContract: writeDepositWeth,
		isPending: depositWethPending,
		isError: depositWethIsError,
		error: depositWethError,
		data: depositHash,
	} = useWriteWeth9Deposit();
	const {
		isLoading: depositConfirming,
		isSuccess: depositConfirmed,
		isError: depositConfirmedIsError,
		error: depositConfirmedError,
	} = useWaitForTransactionReceipt({
		hash: depositHash,
	});
	const { data: allowance } = useReadIerc20Allowance({
		address: currencyAddress,
		chainId: nft.chainId,
		args: [
			address ?? '0x',
			MARKETPLACE_ADDRESS[nft.chainId!] as `0x${string}`,
		],
	});
	const {
		writeContract: writeErc20Approve,
		isPending: erc20ApprovePending,
		data: erc20ApproveHash,
		isError: erc20ApproveIsError,
		error: erc20ApproveError,
	} = useWriteIerc20Approve();
	const {
		isLoading: erc20ApproveConfirming,
		isSuccess: erc20ApproveConfirmed,
		isError: erc20ApproveConfirmedIsError,
		error: erc20ApproveConfirmedError,
	} = useWaitForTransactionReceipt({
		hash: erc20ApproveHash,
	});
	const {
		writeContract: writeMakeOffer,
		isPending: makeOfferPending,
		data: makeOfferHash,
		isError: makeOfferIsError,
		error: makeOfferError,
	} = useWriteNftMarketplaceMakeOffer();
	const {
		isLoading: makeOfferConfirming,
		isSuccess: makeOfferConfirmed,
		isError: makeOfferConfirmedIsError,
		error: makeOfferConfirmedError,
	} = useWaitForTransactionReceipt({
		hash: makeOfferHash,
	});
	useEffect(() => {
		if (depositConfirmed) {
			refetchBalance();
		}
	}, [depositConfirmed]);
	useEffect(() => {
		if (depositWethIsError || depositConfirmedIsError) {
			messageApi.error(t('Deposit WETH failed'));
		}
	}, [
		depositWethIsError,
		depositWethError,
		depositConfirmedIsError,
		depositConfirmedError,
	]);
	useEffect(() => {
		if (!balanceLoading && !decimalsLoading && decimals) {
			if (balance !== undefined) {
				if (balance >= parseUnits(offerPrice.toString(), decimals)) {
					if (currentStep === 0) {
						setCurrentStep((cur) => cur + 1);
						messageApi.success(t('Balance is enough'));
					}
				} else {
					messageApi.error(t('Balance is not enough'));
					setCurrentStep(0);
				}
			}
		}
	}, [balanceLoading, decimalsLoading, balance]);
	useEffect(() => {
		if (erc20ApproveConfirmed) {
			setCurrentStep((cur) => cur + 1);
			messageApi.success(t('Currency approval successful'));
		}
	}, [erc20ApproveConfirming, erc20ApprovePending, erc20ApproveConfirmed]);
	useEffect(() => {
		if (erc20ApproveConfirmedIsError || erc20ApproveIsError) {
			messageApi.error(t('Approve transfer of currency failed'));
		}
	}, [
		erc20ApproveConfirmedError,
		erc20ApproveError,
		erc20ApproveConfirmedIsError,
		erc20ApproveIsError,
	]);
	useEffect(() => {
		if (makeOfferConfirmed) {
			setCurrentStep((cur) => cur + 1);
			messageApi.success(t('Post offer successful'));
		}
	}, [makeOfferConfirmed]);
	useEffect(() => {
		if (makeOfferIsError || makeOfferConfirmedIsError) {
			messageApi.error(t('Post offer failed'));
		}
	}, [
		makeOfferConfirmedError,
		makeOfferConfirmedIsError,
		makeOfferIsError,
		makeOfferError,
	]);
	return (
		<>
			{contextHolder}
			<StepsDialog
				currentStep={currentStep}
				steps={steps}
				loading={
					balanceLoading ||
					decimalsLoading ||
					depositWethPending ||
					depositConfirming ||
					erc20ApprovePending ||
					erc20ApproveConfirming ||
					makeOfferConfirming ||
					makeOfferPending
				}
				successContent={
					<>
						<div className="w-full flex flex-col gap-4 items-center">
							<CircleCheckIcon
								className="text-primary"
								size={36}
							/>
							<h3>{t('Make offer successful')}</h3>
							<Button
								onClick={() => {
									router.reload();
								}}
							>
								{t('Go back to detail page')}
							</Button>
						</div>
					</>
				}
				{...props}
			>
				<>
					<Button
						className="flex w-1/2 py-3 h-auto max-w-64"
						disabled={
							currentStep !== 0 ||
							balanceLoading ||
							decimalsLoading
						}
						variant={currentStep === 0 ? 'default' : 'secondary'}
						onClick={() => {
							if (
								balance !== undefined &&
								decimals &&
								nft.chainId
							) {
								if (
									balance <
									parseUnits(offerPrice.toString(), decimals)
								) {
									if (
										currencyAddress ===
										CHAIN_CURRENCY_ADDRESS[nft.chainId].WETH
									) {
										writeDepositWeth({
											address: currencyAddress,
											chainId: nft.chainId,
											value:
												parseUnits(
													offerPrice.toString(),
													decimals,
												) - balance,
										});
									} else {
										messageApi.error(
											<>
												{t('Please acquire enough')}
												&nbsp;
												<span className="text-muted-foreground text-xs">
													{getCryptoName(
														nft.chainId,
														currencyAddress,
													)}
												</span>
												&nbsp;
												{getCryptoIcon(
													nft.chainId,
													currencyAddress,
												)}
											</>,
										);
									}
								}
							}
						}}
					>
						{balanceLoading ||
						decimalsLoading ||
						balance === undefined ||
						decimals === undefined ? (
							<>{t('Checking Balance')}...</>
						) : balance <
						  parseUnits(offerPrice.toString(), decimals) ? (
							t('Add balance')
						) : (
							<>{t('Balance is enough')}</>
						)}
						&nbsp;
						{getCryptoIcon(nft.chainId!, currencyAddress)}
					</Button>
					<Button
						className="flex w-1/2 py-3 h-auto max-w-64"
						disabled={
							currentStep !== 1 ||
							balanceLoading ||
							decimalsLoading ||
							erc20ApprovePending ||
							erc20ApproveConfirming
						}
						variant={currentStep === 1 ? 'default' : 'secondary'}
						onClick={() => {
							if (
								nft.chainId &&
								decimals &&
								allowance !== undefined
							) {
								writeErc20Approve({
									address: currencyAddress,
									chainId: nft.chainId,
									args: [
										MARKETPLACE_ADDRESS[
											nft.chainId
										] as `0x${string}`,
										allowance +
											parseUnits(
												offerPrice.toString(),
												decimals,
											),
									],
								});
							} else {
								messageApi.error(t('Please retry'));
							}
						}}
					>
						{t('Approve currency transfer')}
					</Button>
					<Button
						className="flex w-1/2 py-3 h-auto max-w-64"
						disabled={
							currentStep !== steps.length - 1 ||
							balanceLoading ||
							decimalsLoading ||
							makeOfferPending ||
							makeOfferConfirming
						}
						variant={
							currentStep === steps.length - 1
								? 'default'
								: 'secondary'
						}
						onClick={() => {
							if (nft.chainId && decimals) {
								writeMakeOffer({
									address: MARKETPLACE_ADDRESS[
										nft.chainId
									] as `0x${string}`,
									chainId: nft.chainId,
									args: [
										nft.contractAddress,
										BigInt(nft.tokenId),
										parseUnits(
											offerPrice.toString(),
											decimals,
										),
										currencyAddress,
									],
								});
							}
						}}
					>
						{t('Post offer')}
					</Button>
				</>
			</StepsDialog>
		</>
	);
}
