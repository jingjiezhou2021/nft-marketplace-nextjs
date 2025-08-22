import StepsDialog from '@/components/steps-dialog';
import { Dialog } from '@/components/ui/dialog';
import { StepProps } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import {
	useWriteIerc721Approve,
	useWriteNftMarketplaceAcceptOffer,
} from 'smart-contract/wagmi/generated';
import { useWaitForTransactionReceipt } from 'wagmi';
import { Button } from '@/components/ui/button';
import useOffer from '@/lib/hooks/use-offer';
import { ChainIdParameter } from '@wagmi/core/internal';
import { config } from '@/components/providers/RainbowKitAllProvider';
import MARKETPLACE_ADDRESS from '@/lib/market';
import useMessage from 'antd/es/message/useMessage';
import { CircleCheckIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
export default function AcceptOfferDialog({
	offerId,
	chainId,
	...props
}: React.ComponentProps<typeof Dialog> & {
	offerId: bigint;
	chainId: NonNullable<ChainIdParameter<typeof config>['chainId']>;
}) {
	const router = useRouter();
	const [messageApi, contextHolder] = useMessage();
	const [currentStep, setCurrentStep] = useState(0);
	const { t, i18n } = useTranslation('offer');
	const steps: StepProps[] = [
		{
			title: t('Approve transfer'),
			description: t(
				'As the owner of this token, you need to approve the market to transfer your token when the offer is accepted',
			),
		},
		{
			title: t('Accept offer'),
			description: t(
				'Everything is ready, now you can finally accept offer',
			),
		},
	];
	const {
		writeContract: writeErc721Approve,
		isPending: erc721ApprovePending,
		error: erc721ApproveError,
		data: erc721ApproveHash,
	} = useWriteIerc721Approve();
	const {
		isLoading: erc721ApproveConfirming,
		isSuccess: erc721ApproveConfirmed,
		error: erc721ApproveConfirmedError,
	} = useWaitForTransactionReceipt({ hash: erc721ApproveHash });
	const { data: offerData, loading: offerDataLoading } = useOffer(
		offerId,
		chainId,
	);
	useEffect(() => {
		if (erc721ApproveError || erc721ApproveConfirmedError) {
			messageApi.error(t('Approve failed'));
		}
	}, [erc721ApproveConfirmedError, erc721ApproveError]);
	useEffect(() => {
		if (erc721ApproveConfirmed && currentStep === 0) {
			setCurrentStep((cur) => cur + 1);
			messageApi.success(t('Approve successful'));
		}
	}, [erc721ApproveConfirmed]);
	const {
		writeContract: writeAcceptOffer,
		isPending: acceptOfferPending,
		data: acceptOfferHash,
		error: acceptOfferError,
	} = useWriteNftMarketplaceAcceptOffer();
	const {
		isLoading: acceptOfferConfirming,
		isSuccess: acceptOfferConfirmed,
		error: acceptOfferConfirmedError,
	} = useWaitForTransactionReceipt({
		hash: acceptOfferHash,
	});
	useEffect(() => {
		if (acceptOfferConfirmedError || acceptOfferError) {
			messageApi.error(t('Accept offer failed'));
		}
	}, [acceptOfferConfirmedError, acceptOfferError]);
	useEffect(() => {
		if (acceptOfferConfirmed && currentStep === 1) {
			setCurrentStep((cur) => cur + 1);
			messageApi.success(t('Accept offer successful'));
		}
	}, [acceptOfferConfirmed]);
	return (
		<>
			{contextHolder}
			<StepsDialog
				currentStep={currentStep}
				steps={steps}
				{...props}
				loading={
					erc721ApproveConfirming ||
					erc721ApprovePending ||
					acceptOfferConfirming ||
					acceptOfferPending ||
					offerDataLoading
				}
				showCloseButton={true}
				successContent={
					<>
						<div className="w-full flex flex-col gap-4 items-center">
							<CircleCheckIcon
								className="text-primary"
								size={36}
							/>
							<h3>{t('Accept offer successful')}</h3>
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
			>
				<Button
					className="flex w-1/2 py-3 h-auto max-w-64"
					disabled={
						currentStep !== 0 ||
						erc721ApproveConfirming ||
						erc721ApprovePending
					}
					variant={currentStep === 0 ? 'default' : 'secondary'}
					onClick={() => {
						if (offerData?.findFirstOffer?.nftAddress) {
							writeErc721Approve({
								address: offerData?.findFirstOffer
									?.nftAddress as `0x${string}`,
								chainId,
								args: [
									MARKETPLACE_ADDRESS[
										chainId
									] as `0x${string}`,
									offerData?.findFirstOffer?.tokenId,
								],
							});
						} else {
							messageApi.error(t('Please retry'));
						}
					}}
				>
					{t('Approve')}
				</Button>
				<Button
					className="flex w-1/2 py-3 h-auto max-w-64"
					disabled={
						currentStep !== 1 ||
						acceptOfferConfirming ||
						acceptOfferPending
					}
					variant={currentStep === 1 ? 'default' : 'secondary'}
					onClick={() => {
						if (chainId && offerId) {
							writeAcceptOffer({
								address: MARKETPLACE_ADDRESS[
									chainId
								] as `0x${string}`,
								chainId,
								args: [offerId],
							});
						} else {
							messageApi.error(t('Please retry'));
						}
					}}
				>
					{t('Accept')}
				</Button>
			</StepsDialog>
		</>
	);
}
