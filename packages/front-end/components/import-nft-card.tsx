import { IconCirclePlus } from '@tabler/icons-react';
import { CardContentWrapper, CardFooterWrapper, CardWrapper } from './nft-card';
import { useTranslation } from 'next-i18next';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { ReactNode, useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import useMessage from 'antd/es/message/useMessage';
import { ALREADY_IMPORTED, importNFT, NOT_OWNER } from '@/lib/nft';
import { useAccount, useChainId } from 'wagmi';
import { chains, config } from './providers/RainbowKitAllProvider';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from './ui/select';
import { getIconOfChain } from '@/lib/chain';
import { cn } from '@/lib/utils';
import { ChainIdParameter } from '@wagmi/core/internal';
import SelectChain from './select-chain';
export default function ImportNFTCard({
	className,
	children,
	...props
}: Parameters<typeof CardWrapper>[0]) {
	const { t } = useTranslation('common');
	return (
		<ImportNFTDialog>
			<CardWrapper
				className={className}
				{...props}
			>
				<CardContentWrapper>
					<div className="size-full text-primary flex justify-center items-center">
						<IconCirclePlus size={128} />
					</div>
				</CardContentWrapper>
				<CardFooterWrapper>
					<h3 className="font-medium text-md pb-2 text-center">
						{t('Import')}
					</h3>
				</CardFooterWrapper>
			</CardWrapper>
		</ImportNFTDialog>
	);
}
export function ImportNFTDialog({ children }: { children: ReactNode }) {
	const { t } = useTranslation('common');
	const [messageApi, contextHolder] = useMessage();
	const [open, setOpen] = useState(false);
	const { address } = useAccount();
	const formik = useFormik({
		initialValues: {
			contractAddress: '',
			tokenId: '',
			chain: '',
		},
		validationSchema: Yup.object({
			contractAddress: Yup.string()
				.required(t('Contract Address is required'))
				.matches(/^0x[a-fA-F0-9]{40}$/, t('Invalid address')),
			tokenId: Yup.string()
				.required(t('Token ID is required'))
				.matches(/^\d+$/, t('Token ID must be a number')),
			chain: Yup.string()
				.required(t('Chain Selection is required'))
				.oneOf(
					chains.map((c) => c.id.toString()),
					t('Chain must be one of the options'),
				),
		}),
		onSubmit: async (values) => {
			if (address === undefined) {
				return;
			}
			console.log('Form submitted:', values);
			try {
				await importNFT(
					address,
					values.contractAddress as `0x${string}`,
					BigInt(parseInt(values.tokenId)),
					parseInt(values.chain) as ChainIdParameter<
						typeof config
					>['chainId'],
				);
				messageApi.success(t('Import Successful'));
			} catch (err) {
				if (err instanceof Error) {
					if (err.message === NOT_OWNER) {
						messageApi.error(
							t('You are not the owner of this NFT'),
						);
					} else if (err.message === ALREADY_IMPORTED) {
						messageApi.warning(
							t('You have already imported the NFT'),
						);
					} else {
						messageApi.error(
							`${t('Unknown error occured when importing')}:${err.message}`,
						);
					}
					return;
				}
			}
			setOpen(false);
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
					<DialogTitle>{t(`Import NFT`)}</DialogTitle>
				</DialogHeader>
				<form
					onSubmit={formik.handleSubmit}
					className="grid gap-4"
				>
					<div className="grid gap-4">
						<div className="grid gap-3">
							<Label htmlFor="contractAddress">
								{t('Contract Address')}
							</Label>
							<Input
								id="contractAddress"
								name="contractAddress"
								value={formik.values.contractAddress}
								onChange={formik.handleChange}
								onBlur={formik.handleBlur}
								className={
									formik.touched.contractAddress &&
									formik.errors.contractAddress
										? 'border-red-500'
										: ''
								}
							/>
							{formik.touched.contractAddress &&
								formik.errors.contractAddress && (
									<p className="text-sm text-red-500">
										{formik.errors.contractAddress}
									</p>
								)}
						</div>
						<div className="grid gap-3">
							<Label htmlFor="tokenId">{t('Token ID')}</Label>
							<Input
								id="tokenId"
								name="tokenId"
								value={formik.values.tokenId}
								onChange={formik.handleChange}
								onBlur={formik.handleBlur}
								className={
									formik.touched.tokenId &&
									formik.errors.tokenId
										? 'border-red-500'
										: ''
								}
							/>
							{formik.touched.tokenId &&
								formik.errors.tokenId && (
									<p className="text-sm text-red-500">
										{formik.errors.tokenId}
									</p>
								)}
						</div>
						<div className="grid gap-3">
							<Label htmlFor="chain">{t('Chain')}</Label>
							<SelectChain
								name="chain"
								onValueChange={(val) => {
									formik.setFieldValue('chain', val);
								}}
								value={formik.values.chain}
							/>
							{formik.touched.chain && formik.errors.chain && (
								<p className="text-sm text-red-500">
									{formik.errors.chain}
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
