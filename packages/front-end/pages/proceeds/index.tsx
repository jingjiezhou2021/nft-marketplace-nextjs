import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Banknote, Loader2, Wallet } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import SelectChain from '@/components/select-chain';
import SelectCrypto from '@/components/select-crypto';
import { ChainIdParameter } from '@wagmi/core/internal';
import { config } from '@/components/providers/RainbowKitAllProvider';
import {
	useReadNftMarketplaceGetProceeds,
	useWriteNftMarketplaceWithdrawProceeds,
} from 'smart-contract/wagmi/generated';
import MARKETPLACE_ADDRESS from '@/lib/market';
import { useAccount, useWaitForTransactionReceipt } from 'wagmi';
import WalletNotConnected from '@/components/wallet-not-connected';
import { LoadingMask, LoadingSpinner } from '@/components/loading';
import CryptoPrice from '@/components/crypto-price';
import useMessage from 'antd/es/message/useMessage';
import useLockedChain from '@/lib/hooks/use-locked-chain';
import { cn } from '@/lib/utils';

export default function ProceedsPage() {
	const { address } = useAccount();
	const [messageApi, contextHolder] = useMessage();
	const { t } = useTranslation('common');
	const [selectedChain, setSelectedChain] = useState<string>();
	useLockedChain(
		(selectedChain ? parseInt(selectedChain) : undefined) as any,
	);
	const [cryptoAddress, setCryptoAddress] = useState<string>();
	const { data, isLoading } = useReadNftMarketplaceGetProceeds({
		address: selectedChain
			? MARKETPLACE_ADDRESS[parseInt(selectedChain)]
			: undefined,
		chainId: selectedChain ? parseInt(selectedChain) : undefined,
		args: [address ?? '0x0', (cryptoAddress ?? '0x0') as `0x${string}`],
		query: {
			refetchInterval: 2000,
		},
	});
	const {
		writeContract,
		isPending,
		error: withdrawError,
		data: withdrawHash,
	} = useWriteNftMarketplaceWithdrawProceeds();
	const {
		isLoading: withdrawConfirming,
		isSuccess: withdrawConfirmed,
		error: withdrawConfirmedError,
	} = useWaitForTransactionReceipt({ hash: withdrawHash });
	useEffect(() => {
		if (withdrawError || withdrawConfirmedError) {
			messageApi.error(t('Withdraw failed'));
		}
	}, [withdrawConfirmedError, withdrawError]);
	useEffect(() => {
		if (withdrawConfirmed) {
			messageApi.success(t('Withdraw successful'));
		}
	}, [withdrawConfirmed]);
	if (!address) {
		return <WalletNotConnected />;
	}
	return (
		<div className="flex justify-center items-center h-full relative">
			{contextHolder}
			<LoadingMask
				className="flex justify-center items-center top-0"
				loading={withdrawConfirming || isPending}
			>
				<LoadingSpinner size={64} />
			</LoadingMask>
			<Card className="w-full max-w-md shadow-lg rounded-2xl">
				<CardHeader>
					<CardTitle className="text-xl font-semibold flex items-center gap-2">
						<Wallet className="w-5 h-5" />
						{t('Collect Proceeds')}
					</CardTitle>
				</CardHeader>
				<Separator />
				<CardContent className="p-6 pt-2">
					<div className="flex flex-col gap-4">
						<SelectChain
							onValueChange={setSelectedChain}
							value={selectedChain}
						/>
						{selectedChain && (
							<SelectCrypto
								className="w-full"
								placeholder={t('Please select currency')}
								chainId={
									parseInt(selectedChain) as ChainIdParameter<
										typeof config
									>['chainId']
								}
								value={cryptoAddress}
								onValueChange={setCryptoAddress}
							/>
						)}
						<div className="text-center flex flex-col gap-2">
							<p className="text-muted-foreground">
								{t('Available Balance')}
							</p>
							<div
								className={cn(
									'relative',
									isLoading && 'min-h-12',
								)}
							>
								<LoadingMask
									className="flex justify-center items-center top-0"
									loading={isLoading}
								>
									<LoadingSpinner size={24} />
								</LoadingMask>
								{selectedChain && cryptoAddress && data && (
									<CryptoPrice
										chainId={parseInt(selectedChain) as any}
										price={data}
										erc20TokenAddress={cryptoAddress}
									/>
								)}
							</div>

							<Button
								className="w-full"
								disabled={!data}
								variant={data ? 'default' : 'destructive'}
								onClick={() => {
									if (
										cryptoAddress &&
										selectedChain &&
										MARKETPLACE_ADDRESS[
											parseInt(selectedChain)
										]
									) {
										writeContract({
											address:
												MARKETPLACE_ADDRESS[
													parseInt(selectedChain)
												],
											chainId: parseInt(selectedChain),
											args: [
												cryptoAddress as `0x${string}`,
											],
										});
									} else {
										messageApi.error(t('Please retry'));
									}
								}}
							>
								<Banknote></Banknote>
								{data ? t('Collect') : t('No Funds Available')}
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
