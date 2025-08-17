import { config } from '@/components/providers/RainbowKitAllProvider';
import StepsDialog from '@/components/steps-dialog';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import MARKETPLACE_ADDRESS from '@/lib/market';
import { ChainIdParameter } from '@wagmi/core/internal';
import useMessage from 'antd/es/message/useMessage';
import { CircleCheckIcon } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
	useReadErc20Decimals,
	useWriteNftMarketplaceListItem,
	useWriteIerc721Approve,
} from 'smart-contract/wagmi/generated';
import { parseUnits } from 'viem';
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
export default function ListItemActionDialog({
	currencyAddress,
	amount,
	chainId,
	address,
	tokenId,
	...props
}: {
	currencyAddress: `0x${string}`;
	amount: number;
	chainId: ChainIdParameter<typeof config>['chainId'];
	address: `0x${string}`;
	tokenId: number;
} & React.ComponentProps<typeof Dialog>) {
	const [messageApi, contextHolder] = useMessage();
	const { t, i18n } = useTranslation('common');
	const { data: decimals } = useReadErc20Decimals({
		address: currencyAddress,
		chainId,
	});
	const {
		writeContract: writeAuthorize,
		isPending: authorizePending,
		data: authorizeHash,
	} = useWriteIerc721Approve();
	const { isLoading: authorizeConfirming, isSuccess: authorizeConfirmed } =
		useWaitForTransactionReceipt({
			hash: authorizeHash,
		});
	const {
		writeContract: writePostListing,
		isPending: postListingPending,
		data: postListingHash,
	} = useWriteNftMarketplaceListItem();
	const {
		isLoading: postListingConfirming,
		isSuccess: postListingConfirmed,
	} = useWaitForTransactionReceipt({
		hash: postListingHash,
	});
	const [currentStep, setCurrentStep] = useState(0);
	useEffect(() => {
		if (!authorizeConfirmed && !postListingConfirmed) {
			setCurrentStep(0);
		} else if (authorizeConfirmed && !postListingConfirmed) {
			messageApi.success(t('Authorize successful'));
			setCurrentStep(1);
		} else if (authorizeConfirmed && postListingConfirmed) {
			messageApi.success(t('Post Listing Item successful'));
			setCurrentStep(2);
		}
	}, [authorizeConfirmed, postListingConfirmed]);
	return (
		<>
			{contextHolder}
			<StepsDialog
				{...props}
				successContent={
					<div className="w-full flex flex-col gap-4 items-center">
						<CircleCheckIcon
							className="text-primary"
							size={36}
						/>
						<h3>{t('Post Listing Item successful')}</h3>
						<Link
							href={`/nft/${chainId}/${address}/${tokenId}`}
							locale={i18n.language}
						>
							<Button>{t('Go back to detail page')}</Button>
						</Link>
					</div>
				}
				loading={
					authorizeConfirming ||
					authorizePending ||
					postListingConfirming ||
					postListingPending
				}
				currentStep={currentStep}
				steps={[
					{
						title: t('Authorization'),
						description: t(
							'Allow the transfer of this NFT when sold',
						),
					},
					{
						title: t('Post'),
						description: t(
							'Everything is ready, now you can finally post your listing',
						),
					},
				]}
			>
				<>
					<Button
						className="flex w-1/2 py-3 h-auto max-w-64"
						disabled={currentStep !== 0}
						variant={currentStep === 0 ? 'default' : 'secondary'}
						onClick={() => {
							writeAuthorize({
								address,
								chainId,
								args: [
									MARKETPLACE_ADDRESS[
										chainId!
									] as `0x${string}`,
									BigInt(tokenId),
								],
							});
						}}
					>
						{t('Authorize')}
					</Button>
					<Button
						className="flex w-1/2 py-3 h-auto max-w-64"
						disabled={currentStep !== 1}
						variant={currentStep === 1 ? 'default' : 'secondary'}
						onClick={() => {
							if (decimals === undefined) {
								const errMsg =
									'Unable to read decimal of the currency';
								// t(
								// 	'Unable to read decimal of the currency',
								// );
								messageApi.error(t(errMsg));
								throw new Error(errMsg);
							}
							writePostListing({
								address: MARKETPLACE_ADDRESS[
									chainId!
								] as `0x${string}`,
								chainId,
								args: [
									address,
									BigInt(tokenId),
									parseUnits(amount.toString(), decimals),
									currencyAddress,
								],
							});
						}}
					>
						{t('Post')}
					</Button>
				</>
			</StepsDialog>
		</>
	);
}
