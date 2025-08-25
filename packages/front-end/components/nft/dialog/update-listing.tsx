import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { NFTDetailProps } from '../detail';
import { Label } from '@/components/ui/label';
import SelectCrypto from '@/components/select-crypto';
import { useQuery } from '@apollo/client';
import findNFT from '@/lib/graphql/queries/find-nft';
import { useFormik } from 'formik';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useWriteNftMarketplaceUpdateListing } from 'smart-contract/wagmi/generated';
import {
	ContractFunctionExecutionError,
	ContractFunctionRevertedError,
	ContractFunctionZeroDataError,
	formatUnits,
	parseUnits,
} from 'viem';
import useCurrencyDecimals from '@/lib/hooks/use-currency-decimals';
import * as Yup from 'yup';
import useMessage from 'antd/es/message/useMessage';
import { useConfig } from 'wagmi';
import { waitForTransactionReceipt } from '@wagmi/core';
import { useRouter } from 'next/router';
import { LoadingMask, LoadingSpinner } from '@/components/loading';
import { cn } from '@/lib/utils';
import MARKETPLACE_ADDRESS from '@/lib/market';
import useLockedChain from '@/lib/hooks/use-locked-chain';
export default function UpdateListingDialog({
	children,
	nft,
}: {
	children: ReactNode;
	nft: NFTDetailProps;
}) {
	useLockedChain(nft.chainId);
	const config = useConfig();
	const router = useRouter();
	const [messageApi, contextHolder] = useMessage();
	const [open, setOpen] = useState(false);
	const { t } = useTranslation('common');
	const { data, loading } = useQuery(findNFT, {
		variables: {
			where: {
				contractAddress: {
					equals: nft.contractAddress,
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
			},
		},
	});
	const { writeContractAsync: writeUpdateListing } =
		useWriteNftMarketplaceUpdateListing();
	const formik = useFormik<{ currencyAddress?: string; price?: bigint }>({
		initialValues: {
			currencyAddress:
				data?.findFirstNFT?.activeItem?.listing.erc20TokenAddress,
			price: data?.findFirstNFT?.activeItem?.listing.price,
		},
		validationSchema: Yup.object({
			currencyAddress: Yup.string()
				.required(t('Please select currency'))
				.matches(/^0x[a-fA-F0-9]{40}$/, t('Invalid address')),
			price: Yup.number()
				.positive(t('Amount must be positive'))
				.required(t('Please input new price amount')),
		}),
		async onSubmit(vals) {
			if (!decimals.data) {
				messageApi.error(t('Failed to retrieve decimals for currency'));
				throw new Error(t('Failed to retrieve decimals for currency'));
			}
			if (vals.currencyAddress && vals.price && nft.chainId) {
				try {
					const hash = await writeUpdateListing({
						address: MARKETPLACE_ADDRESS[
							nft.chainId
						] as `0x${string}`,
						chainId: nft.chainId,
						args: [
							nft.contractAddress,
							BigInt(nft.tokenId),
							vals.currencyAddress as `0x${string}`,
							parseUnits(vals.price.toString(), decimals.data),
						],
					});
					const receipt = await waitForTransactionReceipt(config, {
						hash,
					});
					if (receipt.status === 'success') {
						messageApi.success(t('Update listing item success'));
						setOpen(false);
						router.reload();
					} else {
						messageApi.error(t('Transfer failed'));
						console.error(receipt);
					}
				} catch (err) {
					if (err instanceof Error) {
						if (
							err instanceof ContractFunctionExecutionError ||
							err instanceof ContractFunctionRevertedError ||
							err instanceof ContractFunctionZeroDataError
						) {
							messageApi.error(
								`${t('Update listing failed')}:${err.details}`,
							);
						}
						console.error(err);
					}
				}
			}
		},
	});
	const decimals = useCurrencyDecimals(
		formik.values.currencyAddress as `0x${string}`,
		nft.chainId,
	);
	useEffect(() => {
		formik.resetForm();
	}, [data]);
	useEffect(() => {
		if (!open) {
			formik.resetForm();
		}
	}, [open]);
	return (
		<Dialog
			open={open}
			onOpenChange={setOpen}
		>
			{contextHolder}
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="sm:max-w-[425px] p-0">
				<div className="relative grid gap-4 p-6">
					<LoadingMask
						loading={loading || formik.isSubmitting}
						className="flex justify-center items-center"
					>
						<LoadingSpinner size={48} />
					</LoadingMask>
					<DialogHeader>
						<DialogTitle>{t(`Update Listing`)}</DialogTitle>
					</DialogHeader>
					<form
						className="grid gap-4 relative"
						onSubmit={formik.handleSubmit}
					>
						<div className="grid gap-4">
							<div className="grid gap-3">
								<Label htmlFor="currencyAddress">
									{t('Currency')}
								</Label>
								<SelectCrypto
									name="currencyAddress"
									className="w-full"
									chainId={nft.chainId}
									onValueChange={(val) => {
										formik.setFieldValue(
											'currencyAddress',
											val,
										);
									}}
									value={formik.values.currencyAddress}
								/>
							</div>
							<div className="grid gap-3">
								<Label htmlFor="price">{t('Amount')}</Label>
								<Input
									id="price"
									name="price"
									onChange={formik.handleChange}
									defaultValue={
										formik.values.price && decimals.data
											? formatUnits(
													formik.values.price,
													decimals.data,
												)
											: undefined
									}
									onBlur={formik.handleBlur}
									type="number"
									step="any"
									placeholder={t(
										'Please input new price amount',
									)}
									className={cn(
										formik.errors.price &&
											formik.touched.price &&
											'border-destructive',
									)}
								/>
								{formik.touched.price &&
									formik.errors.price && (
										<p className="text-sm text-destructive">
											{formik.errors.price}
										</p>
									)}
							</div>
							<DialogFooter>
								<DialogClose asChild>
									<Button
										variant="outline"
										disabled={formik.isSubmitting}
									>
										{t('Cancel')}
									</Button>
								</DialogClose>
								<Button
									type="submit"
									disabled={formik.isSubmitting}
								>
									{t('Confirm')}
								</Button>
							</DialogFooter>
						</div>
					</form>
				</div>
			</DialogContent>
		</Dialog>
	);
}
