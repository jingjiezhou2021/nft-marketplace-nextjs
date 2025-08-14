import { ArrowLeft } from 'lucide-react';
import { GetServerSideProps, InferGetStaticPropsType } from 'next';
import { SSRConfig } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { ReactElement, useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';
import { ChainIdParameter } from '@wagmi/core/internal';
import { config } from '@/components/providers/RainbowKitAllProvider';
import { useTranslation } from 'next-i18next';
import ProfileAvatar from '@/components/profile/avatar';
import useNFTMetadata from '@/hooks/use-nft-metadata';
import useCollectionName from '@/hooks/use-collection-name';
import * as Yup from 'yup';
import {
	Select,
	SelectContent,
	SelectTrigger,
	SelectValue,
	SelectItem,
} from '@/components/ui/select';
import { CHAIN_CURRENCY_ADDRESS, getCryptoIcon } from '@/lib/currency';
import { LoadingMask, LoadingSpinner } from '@/components/loading';
import {
	useAccount,
	useWaitForTransactionReceipt,
	useWriteContract,
} from 'wagmi';
import useNFTOwner from '@/hooks/use-nft-owner';
import NotOwnerOfNFT from '@/components/nft/not-owner-of-nft';
import { Form, Formik } from 'formik';
import useMessage from 'antd/es/message/useMessage';
import { NextPageWithLayout } from '@/pages/_app';
import ListItemActionDialog from '@/components/nft/dialog/list-item';
import { useQuery } from '@apollo/client';
import findNFT from '@/lib/graphql/queries/find-nft';
import { QueryMode } from '@/apollo/gql/graphql';
import NFTAlreadyListed from '@/components/nft/nft-already-listed';
import checkOwnerShip from '@/lib/nft/check-ownership';
export const getServerSideProps: GetServerSideProps<
	SSRConfig,
	{ chainId: string; address: `0x${string}`; tokenId: string }
> = async ({ locale, params, resolvedUrl }) => {
	if (params) {
		const { refresh } = await checkOwnerShip(
			params.chainId,
			params.address,
			params.tokenId,
		);
		console.log('refresh:', refresh);
		if (refresh) {
			if (locale) {
				resolvedUrl = `/${locale}${resolvedUrl}`;
			}
			console.log('resolved url:', resolvedUrl);
			return {
				redirect: {
					destination: resolvedUrl,
					permanent: false,
				},
			};
		}
	}
	return {
		props: {
			...(await serverSideTranslations(locale!, ['common'])),
			// Will be passed to the page component as props
		},
	};
};

const Page: NextPageWithLayout = (
	_props: Awaited<InferGetStaticPropsType<typeof getServerSideProps>>,
) => {
	const [messageApi, contextHolder] = useMessage();
	const { t } = useTranslation('common');
	const params = useParams<{
		chainId: string;
		address: `0x${string}`;
		tokenId: string;
	}>();
	const chainId = parseInt(params.chainId) as ChainIdParameter<
		typeof config
	>['chainId'];
	if (chainId === undefined) {
		throw new Error("chainId shouldn't have been undefined");
	}
	const WETH_ADDR = CHAIN_CURRENCY_ADDRESS[chainId].WETH;
	const USDT_ADDR = CHAIN_CURRENCY_ADDRESS[chainId].USDT;
	const address = params.address;
	const tokenId = parseInt(params.tokenId);
	const { metadata, loading: metadataLoading } = useNFTMetadata(
		address,
		tokenId,
		chainId,
	);
	const { name: collectionName, loading: collectionNameLoading } =
		useCollectionName(address, chainId);
	const router = useRouter();
	const [sellMethod, setSellMethod] = useState('set-price');
	const { address: userAddress } = useAccount();
	const nftOwnerAddress = useNFTOwner(address, chainId, tokenId);
	const [openActionDialog, setOpenActionDialog] = useState(false);
	const { data, loading: dataLoading } = useQuery(findNFT, {
		variables: {
			where: {
				contractAddress: {
					equals: address,
					mode: QueryMode.Insensitive,
				},
				tokenId: {
					equals: tokenId,
				},
				collection: {
					is: {
						chainId: {
							equals: chainId,
						},
					},
				},
			},
		},
	});
	let mainContent: ReactElement;
	if (data?.findFirstNFT?.activeItem) {
		mainContent = <NFTAlreadyListed />;
	} else if (nftOwnerAddress.toLowerCase() === userAddress?.toLowerCase()) {
		mainContent = (
			<Formik<{
				currencyAddress: `0x${string}`;
				amount?: number;
			}>
				initialValues={{
					currencyAddress: WETH_ADDR as `0x${string}`,
					amount: undefined,
				}}
				onSubmit={async (vals) => {
					setOpenActionDialog(true);
				}}
				validationSchema={Yup.object<{
					currencyAddress: string;
					amount?: number;
				}>().shape({
					amount: Yup.number()
						.positive(t('Amount must be positive'))
						.required(t('Amount is required')),
					currencyAddress: Yup.string().required(
						t('Please select currency'),
					),
				})}
			>
				{({
					setFieldValue,
					handleChange,
					handleBlur,
					errors,
					values,
				}) => {
					return (
						<>
							<Form className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
								<div>
									<h2 className="text-lg font-semibold mb-4">
										{t('Select your sell method')}
									</h2>

									<Tabs
										value={sellMethod}
										onValueChange={setSellMethod}
									>
										<TabsList className="w-full h-auto">
											<TabsTrigger
												value="set-price"
												className="flex flex-col items-center border rounded-lg p-4 data-[state=active]:border-primary"
											>
												<span className="font-semibold">
													{t('Set Price')}
												</span>
												<span className="text-xs text-muted-foreground">
													{t('Sell at a fixed price')}
												</span>
											</TabsTrigger>
										</TabsList>

										<TabsContent
											value="set-price"
											className="mt-6 space-y-6"
										>
											<>
												<Label
													htmlFor="amount"
													className="mb-2"
												>
													{t('Price')}
												</Label>
												<div className="flex items-center gap-2 mt-1">
													<Select
														value={
															values.currencyAddress
														}
														name="currencyAddress"
														onValueChange={(
															val,
														) => {
															setFieldValue(
																'currencyAddress',
																val,
															);
														}}
													>
														<SelectTrigger
															className="group"
															id="currency"
														>
															<SelectValue
																placeholder={t(
																	'Please select the currency you wanna trade with this item',
																)}
															/>
														</SelectTrigger>
														<SelectContent>
															<SelectItem
																value={
																	WETH_ADDR
																}
															>
																{getCryptoIcon(
																	chainId,
																	WETH_ADDR,
																)}
																ETH
															</SelectItem>
															<SelectItem
																value={
																	USDT_ADDR
																}
															>
																{getCryptoIcon(
																	chainId,
																	USDT_ADDR,
																)}
																USDT
															</SelectItem>
														</SelectContent>
													</Select>
													<Input
														id="amount"
														onChange={handleChange}
														onBlur={handleBlur}
														type="number"
														placeholder={t(
															'Amount',
														)}
														step="any"
													/>
												</div>
												{errors.amount !== undefined ? (
													<p className="text-xs text-destructive">
														{errors.amount}
													</p>
												) : null}
												<p className="text-xs text-muted-foreground mt-1">
													{t(
														'Will be on sale until you transfer this item or cancel it',
													)}
												</p>
											</>
											{/* Price */}
										</TabsContent>
									</Tabs>
								</div>
								{/* Right section: Summary */}
								<div>
									<Card>
										<CardHeader>
											<CardTitle>
												{t('Summary')}
											</CardTitle>
										</CardHeader>
										<CardContent className="space-y-4">
											<Button
												className="w-full cursor-pointer"
												type="submit"
											>
												{t('Post your listing')}
											</Button>
											<div>
												<p className="text-sm text-muted-foreground">
													{t(
														'Listing will interact with blockchain, which involves gas fee',
													)}
												</p>
											</div>
										</CardContent>
									</Card>
								</div>
							</Form>
							<ListItemActionDialog
								currencyAddress={values.currencyAddress}
								amount={values.amount!}
								chainId={chainId}
								address={address}
								tokenId={tokenId}
								open={openActionDialog}
								onOpenChange={setOpenActionDialog}
							/>
						</>
					);
				}}
			</Formik>
		);
	} else {
		mainContent = <NotOwnerOfNFT />;
	}
	return (
		<div className="container mx-auto py-10 space-y-8 relative">
			{contextHolder}
			<LoadingMask
				loading={
					metadataLoading || collectionNameLoading || dataLoading
				}
				className="flex justify-center items-center"
			>
				<LoadingSpinner size={48} />
			</LoadingMask>
			{/* Top NFT info section */}
			<div className="flex items-center gap-4">
				<button
					onClick={() => router.back()}
					className="p-2 hover:bg-muted rounded-full transition"
				>
					<ArrowLeft className="w-5 h-5" />
				</button>

				<ProfileAvatar
					address={address}
					avatar={metadata?.image}
					className="mr-0 size-12"
				/>

				<div>
					<p className="text-sm text-muted-foreground">
						{collectionName}
					</p>
					<h1 className="text-xl font-semibold">{metadata?.name}</h1>
				</div>
			</div>

			{mainContent}
		</div>
	);
};
Page.GetLayout = function NoLayout({ children }) {
	return <div className="w-full h-svh relative">{children}</div>;
};
export default Page;
