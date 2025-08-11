import { LoadingMask, LoadingSpinner } from '@/components/loading';
import { config } from '@/components/providers/RainbowKitAllProvider';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import MARKETPLACE_ADDRESS from '@/lib/market';
import { ChainIdParameter } from '@wagmi/core/internal';
import { Steps } from 'antd';
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
		<Dialog {...props}>
			{contextHolder}
			<DialogContent
				showCloseButton={false}
				onPointerDownOutside={(e) => e.preventDefault()}
				className="md:max-w-5xl"
			>
				<div className="relative flex flex-col gap-6">
					<LoadingMask
						className="flex justify-center items-center top-0"
						loading={
							authorizeConfirming ||
							authorizePending ||
							postListingConfirming ||
							postListingPending
						}
					>
						<LoadingSpinner size={36} />
					</LoadingMask>
					<Steps
						current={currentStep}
						items={[
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
					/>
					<div className="w-full flex-col items-center gap-4 flex relative">
						{currentStep !== 2 ? (
							<>
								<Button
									className="flex w-1/2 py-3 h-auto max-w-64"
									disabled={currentStep !== 0}
									variant={
										currentStep === 0
											? 'default'
											: 'secondary'
									}
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
									variant={
										currentStep === 1
											? 'default'
											: 'secondary'
									}
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
												parseUnits(
													amount.toString(),
													decimals,
												),
												currencyAddress,
											],
										});
									}}
								>
									{t('Post')}
								</Button>
							</>
						) : (
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
									<Button>
										{t('Go back to detail page')}
									</Button>
								</Link>
							</div>
						)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
