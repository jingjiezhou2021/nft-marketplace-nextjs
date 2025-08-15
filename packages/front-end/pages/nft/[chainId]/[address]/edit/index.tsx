import { Category, QueryMode } from '@/apollo/gql/graphql';
import FieldSet from '@/components/field-set';
import { LoadingMask, LoadingSpinner } from '@/components/loading';
import NotOwnerOfCollection from '@/components/nft/collection/not-owner-of-collection';
import { chains, config } from '@/components/providers/RainbowKitAllProvider';
import SelectChain from '@/components/select-chain';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Upload } from '@/components/upload';
import AvatarUpload from '@/components/upload/avatar-upload';
import BannerUpload from '@/components/upload/banner-upload';
import WalletNotConnected from '@/components/wallet-not-connected';
import { getIconOfChain } from '@/lib/chain';
import updateCollectionInfo from '@/lib/graphql/mutations/update-collection';
import findCollection from '@/lib/graphql/queries/find-collection';
import useCollectionCreatorAddress from '@/lib/hooks/use-collection-creator-address';
import { useMutation, useQuery } from '@apollo/client';
import { ChainIdParameter } from '@wagmi/core/internal';
import useMessage from 'antd/es/message/useMessage';
import { ErrorMessage, Field, Formik, FormikProps, useFormik } from 'formik';
import { GetServerSideProps, InferGetStaticPropsType } from 'next';
import { SSRConfig, useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useParams } from 'next/navigation';
import { Ref, useEffect, useRef, useState } from 'react';
import { useAccount } from 'wagmi';
import * as Yup from 'yup';
type FormikValues = {
	nickname?: string | null;
	description?: string | null;
	url?: string | null;
	category?: Category | null;
};
export const getServerSideProps: GetServerSideProps<
	SSRConfig,
	{ chainId: string; address: string }
> = async ({ locale, params }) => {
	return {
		props: {
			...(await serverSideTranslations(locale!, ['common'])),
			// Will be passed to the page component as props
		},
	};
};

const Page = (
	_props: Awaited<InferGetStaticPropsType<typeof getServerSideProps>>,
) => {
	const { t } = useTranslation('common');
	const [messageApi, contextHolder] = useMessage();
	const params = useParams<{ chainId: string; address: `0x${string}` }>();
	const chainId = parseInt(params.chainId) as ChainIdParameter<
		typeof config
	>['chainId'];
	if (chainId === undefined) {
		throw new Error("chainId shouldn't be undefined");
	}
	const collectionAddress = params.address;
	const { address: userAddress, status } = useAccount();
	const { data: collectionCreatorAddress } = useCollectionCreatorAddress(
		chainId,
		collectionAddress,
	);
	const { data, loading, refetch } = useQuery(findCollection, {
		variables: {
			where: {
				chainId: {
					equals: chainId,
				},
				address: {
					equals: collectionAddress,
					mode: QueryMode.Insensitive,
				},
			},
		},
		notifyOnNetworkStatusChange: true,
	});
	const [updateCollectionInfoRun] = useMutation(updateCollectionInfo, {
		variables: {
			where: {
				address: collectionAddress,
				chainId,
			},
			data: {},
		},
	});
	const [banner, setBanner] = useState<Upload>({
		file: null,
		url: null,
	});
	const [avatar, setAvatar] = useState<Upload>({
		file: null,
		url: null,
	});
	const validationSchema = Yup.object().shape({
		url: Yup.string().url(t('Invalid URL')).notRequired(),
	});
	const formik = useFormik<FormikValues>({
		initialValues: {
			nickname: '',
			description: '',
			url: '',
			category: undefined,
		},
		validationSchema: validationSchema,
		onSubmit: async (vals) => {
			try {
				console.log('collection update vals:', vals);
				await updateCollectionInfoRun({
					variables: {
						where: {
							address: collectionAddress,
							chainId,
						},
						data: {
							...vals,
							avatar: avatar.file,
							banner: banner.file,
						},
					},
				});
				refetch();
				messageApi.success(t('Collection info update successful'));
			} catch (err) {
				if (err instanceof Error) {
					messageApi.error(err.message);
				}
			}
		},
	});
	useEffect(() => {
		if (!userAddress) {
			setAvatar({ file: null, url: null });
			setBanner({ file: null, url: null });
			formik.resetForm();
		} else if (data?.findFirstCollection) {
			formik.setValues({
				description: data.findFirstCollection.description,
				nickname: data.findFirstCollection.nickname,
				url: data.findFirstCollection.url,
				category: data.findFirstCollection.category,
			});
			if (data.findFirstCollection.avatar) {
				setAvatar({
					file: null,
					url: new URL(
						data.findFirstCollection.avatar,
						process.env.NEXT_PUBLIC_SERVER_ENDPOINT,
					).toString(),
				});
			}
			if (data.findFirstCollection.banner) {
				setBanner({
					file: null,
					url: new URL(
						data.findFirstCollection.banner,
						process.env.NEXT_PUBLIC_SERVER_ENDPOINT,
					).toString(),
				});
			}
		}
	}, [userAddress, data, status]);
	if (status === 'connected') {
		if (
			collectionCreatorAddress.toLowerCase() === userAddress.toLowerCase()
		) {
			return (
				<>
					<div className="w-full h-full pt-2 relative overflow-hidden">
						{contextHolder}

						<form
							onSubmit={formik.handleSubmit}
							className="h-full"
						>
							<LoadingMask
								loading={loading || formik.isSubmitting}
							/>
							<div className="flex flex-col h-full">
								<div className="grow max-h-[calc(100%-36px)] overflow-y-scroll no-scrollbar">
									<BannerUpload
										bannerUrl={banner.url}
										handleChange={(e) => {
											if (e.target.files === null) {
												return;
											}
											setBanner({
												url: URL.createObjectURL(
													e.target.files[0],
												),
												file: e.target.files[0],
											});
										}}
									/>
									<div className="flex flex-col mx-4 pb-4">
										<AvatarUpload
											avatarUrl={avatar.url}
											handleChange={(e) => {
												if (e.target.files === null) {
													return;
												}
												setAvatar({
													url: URL.createObjectURL(
														e.target.files[0],
													),
													file: e.target.files[0],
												});
											}}
											address={collectionAddress}
										/>
										<h3 className="font-medium leading-tight text-2xl mb-5 mt-2.5">
											{t('Edit Collection Info')}
										</h3>
										<div className="flex flex-col gap-2">
											<FieldSet title={t('Address')}>
												<Input
													className="w-full"
													value={collectionAddress}
													disabled
												/>
											</FieldSet>
											<FieldSet title={t('Chain')}>
												<SelectChain
													value={chainId.toString()}
													disabled
												/>
											</FieldSet>
											<FieldSet
												title={t('Nickname')}
												comment={t(
													'This is the nickname of the collection',
												)}
											>
												<Input
													className="w-full"
													id="nickname"
													name="nickname"
													value={
														formik.values
															.nickname ??
														undefined
													}
													onChange={
														formik.handleChange
													}
												/>
											</FieldSet>
											<FieldSet title={t('Description')}>
												<Textarea
													className="w-full"
													id="description"
													name="description"
													value={
														formik.values
															.description ??
														undefined
													}
													onChange={
														formik.handleChange
													}
												/>
											</FieldSet>
											<FieldSet
												title="URL"
												comment={t(
													"Add a link to the collection's website or social profile",
												)}
											>
												<Input
													className="w-full"
													id="url"
													name="url"
													value={
														formik.values.url ??
														undefined
													}
													onChange={
														formik.handleChange
													}
													onBlur={formik.handleBlur}
												/>
												<p className="text-destructive text-xs">
													{formik.errors.url &&
													formik.touched.url
														? formik.errors.url
														: null}
												</p>
											</FieldSet>
											<FieldSet
												title={t('Category')}
												comment={t(
													'The category of the collection',
												)}
											>
												<Select
													onValueChange={(val) => {
														formik.setFieldValue(
															'category',
															val,
														);
													}}
													value={
														formik.values
															.category ??
														undefined
													}
												>
													<SelectTrigger className="w-full">
														<SelectValue
															placeholder={t(
																'Please select category',
															)}
														/>
													</SelectTrigger>
													<SelectContent>
														{Object.values(
															Category,
														).map((c) => {
															return (
																<SelectItem
																	value={c}
																	key={c}
																>
																	{t(c)}
																</SelectItem>
															);
														})}
													</SelectContent>
												</Select>
											</FieldSet>
										</div>
									</div>
								</div>
								<div className="w-full flex justify-end">
									<Button
										type="submit"
										className="ml-auto"
									>
										{t('Save')}
									</Button>
								</div>
							</div>
						</form>
					</div>
				</>
			);
		} else {
			return <NotOwnerOfCollection />;
		}
	} else if (status === 'disconnected') {
		return <WalletNotConnected />;
	} else {
		return (
			<LoadingMask
				loading={true}
				className="flex justify-center items-center"
			>
				<LoadingSpinner size={48} />
			</LoadingMask>
		);
	}
};

export default Page;
