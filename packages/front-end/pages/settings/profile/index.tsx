import { InferGetStaticPropsType } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import SettingsLayout from '@/components/settings-layout';
import { NextPageWithLayout } from '@/pages/_app';
import { useAccount } from 'wagmi';
import { useTranslation } from 'next-i18next';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import ImageUpload from '@/components/image-upload';
import EmojiAvatar from '@/components/emojo-avatar';
import { useMutation, useQuery } from '@apollo/client';
import updateProfileGQL from '@/lib/graphql/mutations/update-user-profile';
import findUserProfile from '@/lib/graphql/queries/find-user-profile';
import { cn } from '@/lib/utils';
import { Transition } from 'react-transition-group';
import { message } from 'antd';
import WalletNotConnected from '@/components/wallet-not-connected';
type Upload = {
	file: File | undefined;
	url: string | null;
};
export const getStaticProps = async ({ locale }) => {
	return {
		props: {
			...(await serverSideTranslations(locale, ['common'])),
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
		updateQuery,
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
		username?: string;
		bio?: string;
		url?: string;
	}>({
		initialValues: {
			username: undefined,
			bio: undefined,
			url: undefined,
		},
		onSubmit: async (values) => {
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
			setAvatar({ file: undefined, url: null });
			setBanner({ file: undefined, url: null });
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
		file: undefined,
		url: null,
	});
	const [avatar, setAvatar] = useState<Upload>({
		file: undefined,
		url: null,
	});
	const maskRef = useRef<HTMLDivElement>(null);
	if (status === 'connected') {
		return (
			<div className="w-full h-full pt-2">
				{contextHolder}
				<Transition
					nodeRef={maskRef}
					in={loading}
					timeout={300}
					unmountOnExit={true}
					appear={true}
				>
					{(state) => (
						<div
							ref={maskRef}
							className={cn(
								'absolute w-full h-full bg-background opacity-0 transition-opacity ease-in-out duration-300 z-20',
								state === 'entering' && 'opacity-80',
								state === 'entered' && 'opacity-80',
								state === 'exiting' && 'opacity-0',
								state === 'exited' && 'opacity-0',
							)}
						></div>
					)}
				</Transition>
				<form
					className="h-full"
					onSubmit={formik.handleSubmit}
				>
					<div className="flex flex-col h-full">
						<div className="grow max-h-[calc(100%-36px)] overflow-y-scroll no-scrollbar">
							<ImageUpload
								className="border-0 disabled:opacity-40 aspect-8/3 w-full [mask-image:linear-gradient(to_bottom,black,black_calc(100%_-_theme(spacing.16)),transparent)] bg-black cursor-pointer"
								handleChange={(e) => {
									setBanner({
										url: URL.createObjectURL(
											e.target.files[0],
										),
										file: e.target.files[0],
									});
								}}
							>
								{banner.url && (
									<Image
										fill
										src={banner.url}
										priority
										className="opacity-60 transition-opacity duration-300 ease-out-quint group-hover:opacity-80 absolute !top-1/2 size-full -translate-y-1/2 object-cover"
										alt="account-banner"
									/>
								)}
							</ImageUpload>
							<div className="flex flex-col mx-4 pb-4">
								<ImageUpload
									handleChange={(e) => {
										setAvatar({
											url: URL.createObjectURL(
												e.target.files[0],
											),
											file: e.target.files[0],
										});
									}}
									className="border-0 disabled:pointer-events-none disabled:opacity-40 mb-[calc(-40px+theme(spacing.3))] aspect-square size-[80px] -translate-y-1/2 rounded-full z-10 cursor-pointer"
								>
									{avatar.url ? (
										<div className="size-full bg-black relative">
											<Image
												fill
												src={avatar.url}
												className="opacity-60 transition-opacity duration-300 ease-out-quint group-hover:opacity-80 absolute !top-1/2 size-full -translate-y-1/2 object-cover"
												alt="account-banner"
											/>
										</div>
									) : (
										<EmojiAvatar
											address={address}
											className="size-full"
										>
											<div className="size-full absolute top-1/2 -translate-y-1/2 bg-black opacity-20 transition-opacity duration-300 ease-out-quint group-hover:opacity-40"></div>
										</EmojiAvatar>
									)}
								</ImageUpload>
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
											value={formik.values.username}
											onChange={formik.handleChange}
										/>
									</FieldSet>
									<FieldSet title={t('Bio')}>
										<Textarea
											className="w-full"
											id="bio"
											name="bio"
											value={formik.values.bio}
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
											value={formik.values.url}
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
