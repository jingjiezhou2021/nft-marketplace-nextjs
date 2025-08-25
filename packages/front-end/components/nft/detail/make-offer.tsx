import { ChainIdParameter } from '@wagmi/core/internal';
import { NFTDetailProps } from '.';
import { config } from '@/components/providers/RainbowKitAllProvider';
import {
	Drawer,
	DrawerContent,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from '@/components/ui/drawer';
import { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useAccount, useBalance } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import findNFT from '@/lib/graphql/queries/find-nft';
import { useQuery } from '@apollo/client';
import { QueryMode } from '@/apollo/gql/graphql';
import useNFTMetadata from '@/lib/hooks/use-nft-metadata';
import { LoadingMask, LoadingSpinner } from '@/components/loading';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { cn } from '@/lib/utils';
import { formatUnits } from 'viem';
import SelectCrypto from '@/components/select-crypto';
import MakeOfferDialog from '../dialog/make-offer';
import useLockedChain from '@/lib/hooks/use-locked-chain';
export default function MakeOfferDrawer({
	children,
	nft,
	chainId,
}: {
	children: React.ReactNode;
	nft: NFTDetailProps;
	chainId: ChainIdParameter<typeof config>['chainId'];
}) {
	useLockedChain(chainId);
	const [open, setOpen] = useState(false);
	const [openActionDialog, setOpenActionDialog] = useState(false);
	const { t } = useTranslation('common');
	const { address } = useAccount();
	const { openConnectModal } = useConnectModal();
	const { metadata, loading: metadataLoading } = useNFTMetadata(
		nft.contractAddress,
		nft.tokenId,
		nft.chainId,
	);
	const dispName = metadata?.name ?? `# ${nft.tokenId}`;
	useEffect(() => {
		if (open && !address) {
			openConnectModal?.();
			setOpen(false);
		}
	}, [open]);
	const formik = useFormik<{
		offerPrice?: number;
		currencyAddress?: `0x${string}`;
	}>({
		initialValues: {
			offerPrice: undefined,
			currencyAddress: undefined,
		},
		async onSubmit() {
			setOpenActionDialog(true);
		},
		validationSchema: Yup.object({
			offerPrice: Yup.number()
				.required(t('Please input offer price'))
				.positive(t('Offer price should be positive')),
			currencyAddress: Yup.string().required(t('Please select currency')),
		}),
	});
	return (
		<Drawer
			onOpenChange={setOpen}
			open={open}
		>
			<DrawerTrigger asChild>{children}</DrawerTrigger>
			<DrawerContent>
				<div className="w-full p-4 relative">
					<LoadingMask
						loading={metadataLoading}
						className="flex justify-center items-center"
					>
						<LoadingSpinner size={36} />
					</LoadingMask>
					{/* Header */}
					<DrawerHeader className="px-0 py-2">
						<DrawerTitle
							className="text-xl font-semibold"
							asChild
						>
							<h2 className="text-left">{t('Make offer')}</h2>
						</DrawerTitle>
					</DrawerHeader>
					{/* NFT Info */}
					<form onSubmit={formik.handleSubmit}>
						<div className="flex items-center gap-3 border-b pb-4">
							<img
								src={metadata?.image}
								alt="nft-image"
								className="h-14 w-14 rounded-md"
							/>
							<div>
								<p className="font-medium">{dispName}</p>
							</div>
						</div>
						{/* Offer Inputs */}
						<div className="mt-4 space-y-2">
							<div className="flex justify-between text-sm">
								<span>{t('Floor')}</span>
								<span>-</span>
							</div>
							<div className="flex justify-between text-sm">
								<span>{t('Top offer')}</span>
								<span>-</span>
							</div>
							<div className="flex justify-between items-center text-sm">
								<span>{t('Offer price')}</span>
								<div className="flex gap-1 items-center">
									<Input
										type="number"
										name="offerPrice"
										step="any"
										onChange={formik.handleChange}
										onBlur={formik.handleBlur}
										className={cn(
											'w-36 h-8 text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
											formik.errors.offerPrice &&
												formik.touched.offerPrice &&
												'border-destructive',
										)}
									/>
									<SelectCrypto
										chainId={chainId}
										value={formik.values.currencyAddress}
										name="currencyAddress"
										onValueChange={(val) => {
											formik.setFieldValue(
												'currencyAddress',
												val,
											);
										}}
										placeholder=""
										className={cn(
											formik.errors.currencyAddress &&
												formik.touched
													.currencyAddress &&
												'border-destructive',
										)}
									></SelectCrypto>
								</div>
							</div>
							{formik.errors.currencyAddress &&
								formik.touched.currencyAddress && (
									<p className="text-xs text-destructive">
										{formik.errors.currencyAddress}
									</p>
								)}
							{formik.errors.offerPrice &&
								formik.touched.offerPrice && (
									<p className="text-xs text-destructive">
										{formik.errors.offerPrice}
									</p>
								)}
							{/* Breakdown */}
							<div className="mt-6 space-y-2 border-t pt-4 text-sm">
								<div className="flex justify-between text-muted-foreground">
									<span>{t('Floor difference')}</span>
									<span>-</span>
								</div>
							</div>

							{/* Footer */}
							<DrawerFooter className="mt-6 flex items-center justify-between gap-4">
								<Button
									className="w-full"
									type="submit"
								>
									{t('Review offer')}
								</Button>
							</DrawerFooter>
						</div>
					</form>
					{openActionDialog && (
						<MakeOfferDialog
							offerPrice={formik.values.offerPrice!}
							currencyAddress={formik.values.currencyAddress!}
							nft={nft}
							open={openActionDialog}
							onOpenChange={setOpenActionDialog}
						/>
					)}
				</div>
			</DrawerContent>
		</Drawer>
	);
}
