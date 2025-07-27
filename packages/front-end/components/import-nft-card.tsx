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
import { ReactNode, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import useMessage from 'antd/es/message/useMessage';
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
	const formik = useFormik({
		initialValues: {
			contractAddress: '',
			tokenId: '',
		},
		validationSchema: Yup.object({
			contractAddress: Yup.string()
				.required(t('Contract Address is required'))
				.matches(/^0x[a-fA-F0-9]{40}$/, t('Invalid address')),
			tokenId: Yup.string()
				.required(t('Token ID is required'))
				.matches(/^\d+$/, t('Token ID must be a number')),
		}),
		onSubmit: async (values) => {
			console.log('Form submitted:', values);
			messageApi.success(t('Import Successful'));
			setOpen(false);
		},
	});
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
					</div>
					<DialogFooter>
						<DialogClose asChild>
							<Button variant="outline">{t('Cancel')}</Button>
						</DialogClose>
						<Button type="submit">{t('Confirm')}</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
