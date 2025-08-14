import { ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import useMessage from 'antd/es/message/useMessage';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Form, Formik, useFormik } from 'formik';
import { Nft } from '@/apollo/gql/graphql';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import SelectChain from '@/components/select-chain';
import * as Yup from 'yup';
import { Button } from '@/components/ui/button';
import { NFTDetailProps } from '../detail';
import { useWriteIerc721TransferFrom } from 'smart-contract/wagmi/generated';
import { useAccount, useConfig } from 'wagmi';
import { useRouter } from 'next/router';
import { LoadingMask, LoadingSpinner } from '@/components/loading';
import { waitForTransactionReceipt } from '@wagmi/core';
import {
	ContractFunctionExecutionError,
	ContractFunctionRevertedError,
	ContractFunctionZeroDataError,
} from 'viem';
export default function TransferNFTDialog({
	children,
	nft,
}: {
	children: ReactNode;
	nft: NFTDetailProps;
}) {
	const config = useConfig();
	const { t } = useTranslation('common');
	const [open, setOpen] = useState(false);
	const router = useRouter();
	const [messageApi, contextHolder] = useMessage();
	const { writeContractAsync: writeTransferFrom } =
		useWriteIerc721TransferFrom();
	const { address: userAddress } = useAccount();
	const formik = useFormik<{ receiverAddress?: `0x${string}` }>({
		initialValues: {
			receiverAddress: undefined,
		},
		validationSchema: Yup.object({
			receiverAddress: Yup.string()
				.required(t('Receiver Address is required'))
				.matches(/^0x[a-fA-F0-9]{40}$/, t('Invalid address')),
		}),
		onSubmit: async (values) => {
			if (!userAddress) {
				messageApi.error(t('Please first connect with your wallet'));
			} else if (!values.receiverAddress) {
				messageApi.error(t('Invalid receiver address'));
			} else {
				try {
					const hash = await writeTransferFrom({
						address: nft.contractAddress,
						chainId: nft.chainId,
						args: [
							userAddress,
							values.receiverAddress,
							BigInt(nft.tokenId),
						],
					});
					const receipt = await waitForTransactionReceipt(config, {
						hash,
					});
					if (receipt.status === 'success') {
						messageApi.success(t('Transfer successful'));
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
								`${t('Transfer failed')}:${err.details}`,
							);
						}
						console.error(err);
					}
				}
			}
		},
	});
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
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>{t(`Transfer NFT`)}</DialogTitle>
				</DialogHeader>
				<form
					onSubmit={formik.handleSubmit}
					className="grid gap-4 relative"
				>
					<LoadingMask
						loading={formik.isSubmitting}
						className="flex justify-center items-center"
					>
						<LoadingSpinner size={48} />
					</LoadingMask>
					<div className="grid gap-4">
						<div className="grid gap-3">
							<Label htmlFor="contractAddress">
								{t('Contract Address')}
							</Label>
							<Input
								id="contractAddress"
								name="contractAddress"
								value={nft.contractAddress}
								disabled
							/>
						</div>
						<div className="grid gap-3">
							<Label htmlFor="tokenId">{t('Token ID')}</Label>
							<Input
								id="tokenId"
								disabled
								name="tokenId"
								value={nft.tokenId}
							/>
						</div>
						<div className="grid gap-3">
							<Label htmlFor="chain">{t('Chain')}</Label>
							<SelectChain
								name="chain"
								disabled
								value={nft.chainId?.toString()}
							/>
						</div>
						<div className="grid gap-3">
							<Label htmlFor="receiver">
								{t('Receiver Address')}
							</Label>
							<Input
								id="receiver"
								name="receiverAddress"
								value={formik.values.receiverAddress}
								onChange={formik.handleChange}
								onBlur={formik.handleBlur}
								className={
									formik.errors.receiverAddress &&
									formik.touched.receiverAddress
										? 'border-destructive'
										: ''
								}
							></Input>
							{formik.touched.receiverAddress &&
								formik.errors.receiverAddress && (
									<p className="text-sm text-destructive">
										{formik.errors.receiverAddress}
									</p>
								)}
						</div>
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
				</form>
			</DialogContent>
		</Dialog>
	);
}
