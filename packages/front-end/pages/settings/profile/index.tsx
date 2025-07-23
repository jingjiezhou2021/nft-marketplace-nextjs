import { InferGetStaticPropsType } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import SettingsLayout from '@/components/settings-layout';
import { NextPageWithLayout } from '@/pages/_app';
import { useAccount } from 'wagmi';
import { useTranslation } from 'next-i18next';
import { Store } from 'lucide-react';
import { IconEdit } from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { emojiAvatarForAddress } from '@/lib/emojiAvatarForAddress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import createApolloClient from '@/apollo';
import { graphql } from '@/apollo/gql';
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
	// Inside your component:
	const formik = useFormik({
		initialValues: {
			username: null,
			bio: null,
			url: null,
		},
		onSubmit: async (values) => {
			// You can call an API here to save the profile
			const client = createApolloClient();
			const newUserProfileData = {
				address,
				url: values.url,
				bio: values.bio,
				username: values.username,
				avatar: avatar.file,
				banner: banner.file,
			};
			console.log('new user profile:', newUserProfileData);
			const mutation = graphql(`
				mutation updateProfile(
					$newUserProfileData: UserProfileInputData!
				) {
					updateUserAvatar(NewUserProfileData: $newUserProfileData) {
						id
						address
						username
						bio
						url
						avatar
						banner
					}
				}
			`);
			const res = await client.mutate({
				mutation,
				variables: {
					newUserProfileData,
				},
			});
			console.log(res);
		},
		validationSchema: Yup.object({
			username: Yup.string().notRequired(),
			url: Yup.string().url('Invalid URL').notRequired(),
		}),
	});
	const { status, address } = useAccount();
	useEffect(() => {
		if (!address) return;
		const client = createApolloClient();
		client
			.query({
				query: graphql(`
					query FindFirstUserProfile($where: UserProfileWhereInput) {
						findFirstUserProfile(where: $where) {
							address
							avatar
							banner
							bio
							url
							username
						}
					}
				`),
				variables: {
					where: {
						address: {
							equals: address,
						},
					},
				},
			})
			.then((res) => {
				debugger;
				if (res.data.findFirstUserProfile) {
					formik.setValues(res.data.findFirstUserProfile);
				}
				if (res.data.findFirstUserProfile?.avatar) {
					setAvatar({
						file: null,
						url: `http://localhost:4500/${res.data.findFirstUserProfile.avatar}`,
					});
				}
				if (res.data.findFirstUserProfile?.banner) {
					setBanner({
						file: null,
						url: `http://localhost:4500/${res.data.findFirstUserProfile.banner}`,
					});
				}
			});
	}, [address]);
	const { t } = useTranslation('common');
	const [banner, setBanner] = useState<Upload>({
		file: undefined,
		url: null,
	});
	const [avatar, setAvatar] = useState<Upload>({
		file: undefined,
		url: null,
	});
	const uploadBannerInput = useRef<HTMLInputElement>(null);
	const uploadAvatarInput = useRef<HTMLInputElement>(null);
	const emojiAvatar = emojiAvatarForAddress(address);
	if (status === 'connected') {
		return (
			<div className="w-full h-full pt-2">
				<form
					className="h-full"
					onSubmit={formik.handleSubmit}
				>
					<div className="flex flex-col h-full">
						<div className="grow max-h-[calc(100%-36px)] overflow-y-scroll no-scrollbar">
							<button
								className="inline-flex items-center border-0 disabled:pointer-events-none disabled:opacity-40 aspect-8/3 w-full overflow-hidden rounded-t [mask-image:linear-gradient(to_bottom,black,black_calc(100%_-_theme(spacing.16)),transparent)] group relative cursor-pointer bg-black"
								onClick={() => {
									uploadBannerInput.current.click();
								}}
								type="button"
							>
								{banner.url && (
									<Image
										fill
										src={banner.url}
										className="opacity-60 transition-opacity duration-300 ease-out-quint group-hover:opacity-80 absolute !top-1/2 size-full -translate-y-1/2 object-cover"
										alt="account-banner"
									/>
								)}
								<IconEdit className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white"></IconEdit>
								<input
									accept="image/*"
									type="file"
									ref={uploadBannerInput}
									className="invisible"
									onChange={(e) => {
										setBanner({
											url: URL.createObjectURL(
												e.target.files[0],
											),
											file: e.target.files[0],
										});
									}}
								></input>
							</button>
							<div className="flex flex-col mx-4 pb-4">
								<button
									className="border-0 disabled:pointer-events-none disabled:opacity-40 group relative cursor-pointer mb-[calc(-40px+theme(spacing.3))] aspect-square size-[80px] -translate-y-1/2 rounded-full overflow-hidden z-10"
									onClick={() => {
										uploadAvatarInput.current.click();
									}}
									type="button"
								>
									{avatar.url ? (
										<div className="size-full bg-black">
											<Image
												fill
												src={avatar.url}
												className="opacity-60 transition-opacity duration-300 ease-out-quint group-hover:opacity-80 absolute !top-1/2 size-full -translate-y-1/2 object-cover"
												alt="account-banner"
											/>
										</div>
									) : (
										<div
											className="size-full flex justify-center items-center text-3xl"
											style={{
												backgroundColor:
													emojiAvatar.color,
												borderColor: emojiAvatar.color,
											}}
										>
											{emojiAvatar.emoji}
											<div className="size-full absolute top-1/2 -translate-y-1/2 bg-black opacity-20 transition-opacity duration-300 ease-out-quint group-hover:opacity-40"></div>
										</div>
									)}
									<IconEdit
										className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white"
										size={16}
									></IconEdit>
									<input
										accept="image/*"
										type="file"
										ref={uploadAvatarInput}
										className="invisible"
										onChange={(e) => {
											setAvatar({
												url: URL.createObjectURL(
													e.target.files[0],
												),
												file: e.target.files[0],
											});
										}}
									></input>
								</button>
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
		return (
			<div className="w-full h-full flex justify-center items-center">
				<div className="text-muted-foreground">
					{t('Wallet Not Connected')}
				</div>
			</div>
		);
	}
};
Page.GetLayout = SettingsLayout;
export default Page;
