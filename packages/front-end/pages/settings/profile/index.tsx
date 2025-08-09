import { GetServerSideProps, InferGetStaticPropsType } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import SettingsLayout from '@/components/settings-layout';
import { NextPageWithLayout } from '@/pages/_app';
import { useAccount } from 'wagmi';
import { SSRConfig, useTranslation } from 'next-i18next';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import ImageUpload from '@/components/upload/image-upload';
import EmojiAvatar from '@/components/emojo-avatar';
import { useMutation, useQuery } from '@apollo/client';
import updateProfileGQL from '@/lib/graphql/mutations/update-user-profile';
import findUserProfile from '@/lib/graphql/queries/find-user-profile';
import { cn } from '@/lib/utils';
import { Transition } from 'react-transition-group';
import { message } from 'antd';
import WalletNotConnected from '@/components/wallet-not-connected';
import { LoadingMask } from '@/components/loading';
import BannerUpload from '@/components/upload/banner-upload';
import AvatarUpload from '@/components/upload/avatar-upload';
type Upload = {
	file: File | null;
	url: string | null;
};
export const getStaticProps: GetServerSideProps<
	SSRConfig,
	{ chainId: string; address: string }
> = async ({ locale }) => {
	return {
		props: {
			...(await serverSideTranslations(locale!, ['common'])),
			// Will be passed to the page component as props
		},
		revalidate: 60,
	};
};
function FieldSet({
	title,
	comment,
	children,
	className,
}: {
	title: string;
	comment?: string;
} & React.ComponentProps<'fieldset'>) {
	return (
		<fieldset className={className}>
			<div className="flex flex-col gap-2">
				<h4 className="leading-normal text-sm font-medium">{title}</h4>
				{children}
				<p className="leading-normal text-xs text-muted-foreground">
					{comment}
				</p>
			</div>
		</fieldset>
	);
}
const Page: NextPageWithLayout = (
	_props: InferGetStaticPropsType<typeof getStaticProps>,
) => {
	const { status, address } = useAccount();
	const [updateProfileFunc, { loading: updateLoading }] =
		useMutation(updateProfileGQL);
	const [messageApi, contextHolder] = message.useMessage();
	const {
		loading: findProfileLoading,
		data: userProfile,
		refetch,
	} = useQuery(findUserProfile, {
		variables: {
			where: {
				address: {
					equals: address,
				},
			},
		},
		notifyOnNetworkStatusChange: true,
	});
	// Inside your component:
	const formik = useFormik<{
		username?: string | null;
		bio?: string | null;
		url?: string | null;
	}>({
		initialValues: {
			username: undefined,
			bio: undefined,
			url: undefined,
		},
		onSubmit: async (values) => {
			if (!address) {
				messageApi.error(t("address should'nt have been null"));
				return;
			}
			const newUserProfileData = {
				address,
				url: values.url,
				bio: values.bio,
				username: values.username,
				avatar: avatar.file,
				banner: banner.file,
			};
			console.log('new user profile:', newUserProfileData);
			const res = await updateProfileFunc({
				variables: {
					newUserProfileData,
				},
			});
			messageApi.success(t('Update Successful'));
			refetch();
			console.log(res);
		},
		validationSchema: Yup.object({
			username: Yup.string().notRequired(),
			url: Yup.string().url('Invalid URL').notRequired(),
		}),
	});
	useEffect(() => {
		if (!address) {
			formik.resetForm();
			setAvatar({ file: null, url: null });
			setBanner({ file: null, url: null });
		} else if (userProfile && userProfile.findFirstUserProfile) {
			if (userProfile.findFirstUserProfile) {
				formik.setValues(userProfile.findFirstUserProfile);
			}
			if (userProfile.findFirstUserProfile?.avatar) {
				setAvatar({
					file: null,
					url: new URL(
						userProfile.findFirstUserProfile.avatar,
						process.env.NEXT_PUBLIC_SERVER_ENDPOINT,
					).toString(),
				});
			}
			if (userProfile.findFirstUserProfile?.banner) {
				setBanner({
					file: null,
					url: new URL(
						userProfile.findFirstUserProfile.banner,
						process.env.NEXT_PUBLIC_SERVER_ENDPOINT,
					).toString(),
				});
			}
		}
	}, [address, userProfile]);
	const [loading, setLoading] = useState(true);
	useEffect(() => {
		setLoading(findProfileLoading || updateLoading);
	}, [findProfileLoading, updateLoading]);

	useEffect(() => {
		if (status === 'connected') {
			refetch();
		}
	}, [status, refetch]);
	const { t } = useTranslation('common');
	const [banner, setBanner] = useState<Upload>({
		file: null,
		url: null,
	});
	const [avatar, setAvatar] = useState<Upload>({
		file: null,
		url: null,
	});
	if (status === 'connected') {
		return (
			<div className="w-full h-full pt-2">
				{contextHolder}
				<LoadingMask loading={loading} />
				<form
					className="h-full"
					onSubmit={formik.handleSubmit}
				>
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
									address={address}
								/>
								<h3 className="font-medium leading-tight text-2xl mb-5 mt-2.5">
									{t('Edit Profile')}
								</h3>
								<div className="flex flex-col gap-2">
									<FieldSet
										title={t('Username')}
										comment={t(
											'This is your public username',
										)}
									>
										<Input
											className="w-full"
											id="username"
											name="username"
											value={
												formik.values.username ??
												undefined
											}
											onChange={formik.handleChange}
										/>
									</FieldSet>
									<FieldSet title={t('Bio')}>
										<Textarea
											className="w-full"
											id="bio"
											name="bio"
											value={
												formik.values.bio ?? undefined
											}
											onChange={formik.handleChange}
										/>
									</FieldSet>
									<FieldSet
										title="URL"
										comment={t(
											'Add a link to your website or social profile',
										)}
									>
										<Input
											className="w-full"
											id="url"
											name="url"
											value={
												formik.values.url ?? undefined
											}
											onChange={formik.handleChange}
										/>
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
		);
	} else if (status === 'disconnected') {
		return <WalletNotConnected />;
	}
};
Page.GetLayout = SettingsLayout;
export default Page;
